"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react";
import { Squircle } from "@/components/ui/github-activity-utils/squircle";
import { cn } from "@/lib/utils";

const DEFAULT_CELL_SIZE = 11;
const DEFAULT_LABEL = "Top practice categories:";
const DEFAULT_MONTHS = 12;
const WEEKS_PER_MONTH = 365.25 / 12 / 7;
const STACK_LIMIT = 3;
const MIN_CARD_WIDTH = 320;
const MIN_LABEL_WEEKS = 3;
const CHROME_WIDTH = 40;

const gapFor = (cellSize) => Math.max(2, Math.round(cellSize / 4));
const weeksFor = (months) =>
  Math.max(1, Math.ceil(months * WEEKS_PER_MONTH));

const useIsoLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

const EASE_OUT = [0.22, 1, 0.36, 1];
const SPRING = { type: "spring", bounce: 0.2, duration: 0.62 };
const HEADER_SPRING = { ...SPRING, bounce: 0.45 };
const ROW_SPRING = { ...SPRING, bounce: 0.26, delay: 0.08 };
const ROW_OFFSET = 16;
const CELL_FADE = { duration: 0.2, ease: EASE_OUT };
const TOOLTIP_FADE = { duration: 0.14, ease: EASE_OUT };
const TOOLTIP_EDGE = 8;
const COLUMN_STAGGER = 0.012;
const LABEL_BLUR = 6;
const LABEL_REVEAL = { duration: 0.45, ease: EASE_OUT };

const LEVELS = [0, 1, 2, 3, 4];

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const SURFACE = [
  "relative max-w-full p-4 select-none",
  "sm:p-5",
].join(" ");

const VARIANTS = {
  white: {
    paint: "bg-white dark:bg-[#1c1c1f]",
    ink: "text-foreground",
  },
  calamansi: {
    paint: "bg-gradient-to-br from-[#121c16] via-[#101913] to-[#0a100c]",
    ink: "text-white",
  },
  slate: {
    paint: "bg-gradient-to-br from-[#171a29] via-[#111320] to-[#0b0d14]",
    ink: "text-white",
  },
  citrus: {
    paint: "bg-gradient-to-br from-[#2a170c] via-[#1f1008] to-[#120904]",
    ink: "text-white",
  },
  matte: {
    paint: "bg-transparent",
    ink: "text-white",
  },
};

const ACCENTS = {
  white: [
    "color-mix(in oklab, currentcolor 22%, transparent)",
    "color-mix(in oklab, currentcolor 45%, transparent)",
    "color-mix(in oklab, currentcolor 70%, transparent)",
    "currentcolor",
  ],
  calamansi: ["#3b82f6", "#60a5fa", "#93c5fd", "#38bdf8"],
  slate: ["#6366f1", "#818cf8", "#a5b4fc", "#c7d2fe"],
  citrus: ["#f59e0b", "#fbbf24", "#fcd34d", "#fde68a"],
  matte: ["#3b82f6", "#60a5fa", "#93c5fd", "#38bdf8"],
};

const CONTENT = "relative z-10 flex flex-col";

function toMonthLabels(weeks) {
  const labels = weeks.map(() => null);
  if (!weeks.length) return labels;

  // Single-month view (e.g., Dashboard)
  if (weeks.length <= 6) {
    const midWeek = weeks[Math.floor(weeks.length / 2)] || weeks[0];
    const dominantMonthIndex = Number(midWeek?.[0]?.date.slice(5, 7)) - 1;
    labels[0] = MONTH_NAMES[dominantMonthIndex] ?? null;
    return labels;
  }

  // Full-year 52-week rolling view: place a label for every month transition
  const getMonthNum = (index) => Number(weeks[index]?.[0]?.date.slice(5, 7)) - 1;

  let lastPlacedCol = -4;

  for (let i = 0; i < weeks.length; i++) {
    const currentMonth = getMonthNum(i);
    const prevMonth = i > 0 ? getMonthNum(i - 1) : -1;

    // Label first column and each subsequent month change
    if (i === 0 || currentMonth !== prevMonth) {
      if (i - lastPlacedCol >= 2 && i <= weeks.length - 2) {
        labels[i] = MONTH_NAMES[currentMonth] ?? null;
        lastPlacedCol = i;
      }
    }
  }

  return labels;
}

const LEVEL_OPACITY = {
  0: 0,
  1: 0.3,
  2: 0.52,
  3: 0.76,
  4: 1,
};

const DATE_FORMAT = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function describeDay({ count, date }) {
  const noun = count === 1 ? "problem solved" : "problems solved";
  return `${count} ${noun} on ${DATE_FORMAT.format(new Date(`${date}T00:00:00`))}`;
}

const CALENDAR_API = "https://github-contributions-api.jogruber.de/v4";
const EVENTS_API = "https://api.github.com/users";

async function fetchCalendar(login) {
  try {
    const res = await fetch(`${CALENDAR_API}/${login}?y=last`);
    if (!res.ok) return null;

    const days = (await res.json())?.contributions ?? [];
    if (!days.length) return null;

    const start = days.findIndex(
      (day) => new Date(`${day.date}T00:00:00Z`).getUTCDay() === 0,
    );

    return days.slice(start < 0 ? 0 : start).map((day) => ({
      date: day.date,
      count: day.count,
      level: Math.min(4, Math.max(0, day.level)),
    }));
  } catch {
    return null;
  }
}

async function fetchRepos(login) {
  try {
    const res = await fetch(`${EVENTS_API}/${login}/events/public?per_page=100`);
    if (!res.ok) return [];

    const events = await res.json();
    const counts = new Map();

    for (const event of events) {
      if (event.type !== "PushEvent" || !event.repo) continue;
      const commits = event.payload?.commits?.length ?? 1;
      counts.set(event.repo.name, (counts.get(event.repo.name) ?? 0) + commits);
    }

    return [...counts.entries()]
      .sort(([, a], [, b]) => b - a)
      .slice(0, STACK_LIMIT)
      .map(([fullName, count]) => {
        const [owner, name] = fullName.split("/");
        return {
          name,
          count,
          href: `https://github.com/${fullName}`,
          logo:
            owner.toLowerCase() === login.toLowerCase() ? undefined : (
              <img src={`https://github.com/${owner}.png?size=64`} alt="" />
            ),
        };
      });
  } catch {
    return [];
  }
}

function useGitHubUser(login) {
  const [data, setData] = React.useState();

  React.useEffect(() => {
    if (!login) return;
    let active = true;

    Promise.all([fetchCalendar(login), fetchRepos(login)])
      .then(([contributions, repos]) => {
        if (active && contributions) setData({ contributions, repos });
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [login]);

  return data;
}

function emptyDays(weeks) {
  const today = new Date();
  return Array.from({ length: weeks * 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (weeks * 7 - 1 - i));
    return {
      date: date.toISOString().slice(0, 10),
      count: 0,
      level: 0,
    };
  });
}

function toScale(accent) {
  if (typeof accent === "string") {
    return LEVELS.map((level) => ({
      backgroundColor: accent,
      opacity: LEVEL_OPACITY[level],
    }));
  }

  const colors = accent.length > 4 ? accent : ["transparent", ...accent];
  return LEVELS.map((level) => {
    const color = colors[level] ?? colors.at(-1) ?? "transparent";
    return {
      backgroundColor: color,
      opacity: color === "transparent" ? 0 : 1,
      boxShadow:
        level >= 3
          ? "0 0 10px rgba(96, 165, 250, 0.45)"
          : undefined,
    };
  });
}

function toWeeks(contributions) {
  const weeks = [];
  for (let i = 0; i < contributions.length; i += 7) {
    weeks.push(contributions.slice(i, i + 7));
  }
  return weeks;
}

function useFittedColumns(cellSize, gap) {
  const ref = React.useRef(null);
  const [columns, setColumns] = React.useState();

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? el.clientWidth;
      setColumns(Math.max(1, Math.floor((width + gap) / (cellSize + gap))));
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [cellSize, gap]);

  return [ref, columns];
}

const Tooltip = ({ hovered, reduceMotion }) => {
  const ref = React.useRef(null);

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const half = el.offsetWidth / 2;
    const edge = TOOLTIP_EDGE + half;
    el.style.left = `${Math.min(Math.max(hovered.x, edge), window.innerWidth - edge)}px`;
  }, [hovered]);

  return createPortal(
    <div
      ref={ref}
      className="pointer-events-none fixed z-50"
      style={{
        left: hovered.x,
        top: hovered.y,
        transform: "translate(-50%, calc(-100% - 8px))",
      }}
    >
      <motion.div
        className="whitespace-nowrap rounded-lg bg-zinc-900 border border-white/20 px-2.5 py-1 text-[11px] font-medium text-white shadow-xl"
        initial={reduceMotion ? false : { opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.94 }}
        transition={reduceMotion ? { duration: 0 } : TOOLTIP_FADE}
      >
        {describeDay(hovered.day)}
      </motion.div>
    </div>,
    document.body,
  );
};

const ContributionGrid = ({
  contributions,
  scale,
  cellSize,
  months,
  showMonths,
  label,
  reduceMotion,
}) => {
  const weeks = React.useMemo(() => toWeeks(contributions), [contributions]);
  const gap = gapFor(cellSize);
  const [ref, columns] = useFittedColumns(cellSize, gap);
  const [hovered, setHovered] = React.useState();

  const cap = Math.min(weeks.length, weeksFor(months));
  const visible = weeks.slice(-Math.min(cap, columns ?? cap));
  const sweepEnd = (visible.length - 1) * COLUMN_STAGGER + CELL_FADE.duration;

  const hover = (day) => (event) => {
    const cell = event.currentTarget.getBoundingClientRect();
    setHovered({ day, x: cell.left + cell.width / 2, y: cell.top });
  };

  return (
    <div
      ref={ref}
      data-slot="github-activity-grid"
      role="img"
      aria-label={label}
      className="relative"
    >
      {showMonths && (
        <motion.div
          className="flex justify-center"
          style={{ gap, marginBottom: gap }}
          initial={
            reduceMotion
              ? false
              : { opacity: 0, filter: `blur(${LABEL_BLUR}px)` }
          }
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{
            ...LABEL_REVEAL,
            delay: reduceMotion ? 0 : sweepEnd,
          }}
        >
          {toMonthLabels(visible).map((month, index) => (
            <div
              key={index}
              className="relative h-3 shrink-0"
              style={{ width: cellSize }}
            >
              {month && (
                <span className="absolute top-0 left-0 text-[11px] font-bold text-zinc-100">
                  {month}
                </span>
              )}
            </div>
          ))}
        </motion.div>
      )}

      <div
        className="flex justify-center overflow-hidden"
        style={{ gap }}
        onPointerLeave={() => setHovered(undefined)}
      >
        {visible.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col" style={{ gap }}>
            {week.map((day) => (
              <motion.div
                key={day.date}
                onPointerEnter={hover(day)}
                className="shrink-0 rounded-[3.5px] transition-transform duration-150 hover:scale-125 hover:z-10"
                style={{
                  width: cellSize,
                  height: cellSize,
                  backgroundColor: day.level === 0 ? '#0a0a0f' : undefined,
                  border: day.level === 0 ? '1px solid rgba(255,255,255,0.03)' : '1px solid rgba(255,255,255,0.15)',
                }}
                initial={reduceMotion ? false : { opacity: 0, scale: 0.4 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  ...CELL_FADE,
                  delay: reduceMotion ? 0 : weekIndex * COLUMN_STAGGER,
                }}
              >
                {day.level > 0 && (
                  <div
                    className="h-full w-full rounded-[2.5px]"
                    style={scale[day.level] ?? scale[0]}
                  />
                )}
              </motion.div>
            ))}
          </div>
        ))}
      </div>

      <AnimatePresence>
        {hovered && (
          <Tooltip
            key="tooltip"
            hovered={hovered}
            reduceMotion={reduceMotion}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const Avatar = ({
  repo,
  layoutId,
  transition,
  className,
}) => (
  <motion.span
    layoutId={layoutId}
    transition={transition}
    className={cn(
      "grid size-7 shrink-0 place-items-center overflow-hidden rounded-full bg-white/20 text-[11px] font-semibold text-white uppercase ring-1 ring-white/20",
      "[&_img]:size-full [&_img]:object-cover [&_svg]:size-full",
      className,
    )}
  >
    {repo.logo ?? repo.name.charAt(0)}
  </motion.span>
);

const RepoRow = ({
  repo,
  layoutId,
  transition,
}) => {
  const className =
    "flex items-center gap-3 rounded-xl mx-2 px-2 py-2 transition-colors hover:bg-white/[0.14]";

  const displayName = repo.label ?? repo.name;

  const content = (
    <>
      <Avatar repo={repo} layoutId={layoutId} transition={transition} />
      <span className="flex-1 truncate text-sm text-white">{displayName}</span>
      <span className="text-sm tabular-nums text-white/80">{repo.count}</span>
    </>
  );

  return repo.href ? (
    <a href={repo.href} target="_blank" rel="noreferrer" className={className}>
      {content}
    </a>
  ) : (
    <div className={className}>{content}</div>
  );
};

const Chevron = ({ open, transition }) => (
  <motion.svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
    className="size-7 text-white/70"
    initial={false}
    animate={{ rotate: open ? 180 : 0 }}
    transition={transition}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="m16 10-4 4-4-4" />
  </motion.svg>
);

const GitHubActivity = ({
  className,
  username,
  contributions: contributionsProp = [],
  repos: reposProp = [],
  year,
  variant = "calamansi",
  accent,
  cellSize = DEFAULT_CELL_SIZE,
  months = DEFAULT_MONTHS,
  showMonths = false,
  label = DEFAULT_LABEL,
  defaultOpen = false,
  open: openProp,
  onOpenChange,
  style,
  headingText,
  hideHeading = false,
  fullWidth = false,
  showLegend = false,
  ...props
}) => {
  const reduceMotion = useReducedMotion();
  const uid = React.useId();
  const [openState, setOpenState] = React.useState(defaultOpen);

  const open = openProp ?? openState;
  const toggle = () => {
    if (openProp === undefined) setOpenState(!open);
    onOpenChange?.(!open);
  };

  const needsFetch = !contributionsProp.length && username;
  const fetched = useGitHubUser(needsFetch ? username : undefined);
  const placeholder = React.useMemo(
    () => emptyDays(weeksFor(months)),
    [months],
  );

  const contributions = contributionsProp.length
    ? contributionsProp
    : (fetched?.contributions ?? placeholder);
  const repos = reposProp.length ? reposProp : (fetched?.repos ?? []);

  const scale = React.useMemo(
    () => toScale(accent ?? ACCENTS[variant]),
    [accent, variant],
  );
  const transition = reduceMotion ? { duration: 0 } : SPRING;
  const headerTransition = reduceMotion ? { duration: 0 } : HEADER_SPRING;
  const rowTransition = reduceMotion ? { duration: 0 } : ROW_SPRING;

  const kick = reduceMotion ? {} : { x: ROW_OFFSET, y: ROW_OFFSET };
  const listMotion = {
    initial: { opacity: 0, ...kick },
    animate: { opacity: 1, x: 0, y: 0 },
    exit: { opacity: 0, ...kick },
  };

  const total = React.useMemo(
    () => contributions.reduce((sum, day) => sum + (day.count || 0), 0),
    [contributions],
  );

  const parsedYear = Number(contributions.at(-1)?.date.slice(0, 4));
  const displayYear = year ?? (Number.isFinite(parsedYear) ? parsedYear : new Date().getFullYear());
  const heading = headingText ?? `${total} practice sessions in ${displayYear}`;

  const gap = gapFor(cellSize);
  const columns = Math.min(
    Math.ceil(contributions.length / 7),
    weeksFor(months),
  );
  const computedWidth = Math.max(
    MIN_CARD_WIDTH,
    columns * (cellSize + gap) - gap + CHROME_WIDTH,
  );
  const width = fullWidth ? "100%" : computedWidth;

  const isMatte = variant === "matte";

  return (
    <div
      data-slot="github-activity"
      data-variant={variant}
      className={cn(
        isMatte ? "relative max-w-full select-none" : SURFACE,
        VARIANTS[variant].ink,
        className
      )}
      style={{ width, ...style }}
      {...props}
    >
      {!isMatte && <Squircle className={VARIANTS[variant].paint} />}

      <div className={cn(CONTENT, repos.length > 0 && "pb-[76px]")}>
        {!hideHeading && (
          <p className="mb-4 px-1.5 text-base font-bold tracking-tight text-white">
            {heading}
          </p>
        )}

        <ContributionGrid
          contributions={contributions}
          scale={scale}
          cellSize={cellSize}
          months={months}
          showMonths={showMonths}
          label={heading}
          reduceMotion={reduceMotion}
        />

        {showLegend && (
          <div className="flex items-center justify-between text-[11px] text-zinc-200 font-semibold mt-3 px-1 w-full max-w-full">
            <span className="text-zinc-100 font-bold">{total} practice sessions recorded</span>
            <div className="flex items-center gap-1.5 text-zinc-200 font-medium">
              <span className="text-zinc-200 font-semibold">Less</span>
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-[2px]" style={{ backgroundColor: '#0a0a0f', border: '1px solid rgba(255,255,255,0.03)' }} />
                <div className="w-2.5 h-2.5 rounded-[2px] bg-[#3b82f6]/40" />
                <div className="w-2.5 h-2.5 rounded-[2px] bg-[#60a5fa]/70" />
                <div className="w-2.5 h-2.5 rounded-[2px] bg-[#3b82f6]" />
                <div className="w-2.5 h-2.5 rounded-[2px] bg-[#60a5fa] shadow-[0_0_8px_rgba(96,165,250,0.6)]" />
              </div>
              <span className="text-zinc-200 font-semibold">More</span>
            </div>
          </div>
        )}

        {repos.length > 0 && (
          <motion.div
            layout
            id={`${uid}-panel`}
            data-slot="github-activity-panel"
            data-state={open ? "open" : "closed"}
            className={cn(
              "absolute inset-x-2 bottom-2 overflow-hidden rounded-[18px] bg-black/75 shadow-[0_16px_36px_-16px_rgba(0,0,0,0.7)] ring-1 ring-white/15 backdrop-blur-xl",
              open && "top-2",
            )}
            transition={transition}
          >
            <motion.div
              layout="position"
              transition={headerTransition}
              className="flex items-center justify-between gap-3 px-4 py-3"
            >
              <span className="truncate text-sm font-medium text-white">
                {label}
              </span>

              <div className="flex items-center gap-3">
                {!open && (
                  <div className="flex items-center">
                    {repos.slice(0, STACK_LIMIT).map((repo, index) => (
                      <Avatar
                        key={index}
                        repo={repo}
                        layoutId={`${uid}-${index}`}
                        transition={transition}
                        className="-ml-2 first:ml-0"
                      />
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={toggle}
                  aria-expanded={open}
                  aria-controls={`${uid}-panel`}
                  aria-label={
                    open ? "Hide details" : "Show details"
                  }
                  className="grid size-7 shrink-0 cursor-pointer place-items-center rounded-full bg-white/15 transition-colors hover:bg-white/25"
                >
                  <Chevron open={open} transition={transition} />
                </button>
              </div>
            </motion.div>

            <AnimatePresence initial={false} mode="popLayout">
              {open && (
                <motion.ul
                  key="list"
                  layout="position"
                  {...listMotion}
                  transition={rowTransition}
                  className="px-0.5 pb-1"
                >
                  {repos.map((repo, index) => (
                    <li key={index}>
                      <RepoRow
                        repo={repo}
                        layoutId={`${uid}-${index}`}
                        transition={transition}
                      />
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export { GitHubActivity };
export default GitHubActivity;
