"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";

import { companies, Company } from "@/data/companies";
import { fmt, fmtEmp, getBloatCategory, getColor } from "@/lib/utils";

type BloatCategory = "lean" | "normal" | "bloated" | "finance";
type ViewMode = "BUBBLES" | "SCATTER" | "RANKING";
type SortMode = "BLOAT SCORE" | "HEADCOUNT" | "REV / EMPLOYEE" | "MARKET CAP";

type CompanyWithMetrics = Company & {
  revenuePerEmployee: number;
  bloat: BloatCategory;
};

type CompanyNode = CompanyWithMetrics & d3.SimulationNodeDatum;

type TooltipState = {
  visible: boolean;
  x: number;
  y: number;
  company: CompanyWithMetrics | null;
};

const VIEW_OPTIONS: ViewMode[] = ["BUBBLES", "SCATTER", "RANKING"];
const SORT_OPTIONS: SortMode[] = ["BLOAT SCORE", "HEADCOUNT", "REV / EMPLOYEE", "MARKET CAP"];

const BLOAT_ORDER: Record<BloatCategory, number> = {
  bloated: 0,
  normal: 1,
  lean: 2,
  finance: 3
};

function withMetrics(company: Company): CompanyWithMetrics {
  const revenuePerEmployee = company.revenue / company.employees;
  const enriched = { ...company, revenuePerEmployee };
  return {
    ...enriched,
    bloat: getBloatCategory(enriched)
  };
}

function getBadgeLabel(bloat: BloatCategory): string {
  switch (bloat) {
    case "lean":
      return "LEAN";
    case "normal":
      return "NORMAL";
    case "bloated":
      return "BLOATED";
    case "finance":
      return "FINANCIALS*";
    default:
      return "N/A";
  }
}

export default function BloatIndex() {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const chartWrapRef = useRef<HTMLDivElement | null>(null);

  const [sectorFilter, setSectorFilter] = useState("ALL SECTORS");
  const [sortMode, setSortMode] = useState<SortMode>("BLOAT SCORE");
  const [viewMode, setViewMode] = useState<ViewMode>("BUBBLES");
  const [dimensions, setDimensions] = useState({ width: 960, height: 640 });
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    company: null
  });

  const enrichedCompanies = useMemo(() => companies.map(withMetrics), []);

  const sectors = useMemo(
    () => ["ALL SECTORS", ...Array.from(new Set(enrichedCompanies.map((c) => c.sector))).sort()],
    [enrichedCompanies]
  );

  const filteredCompanies = useMemo(() => {
    const scoped =
      sectorFilter === "ALL SECTORS"
        ? [...enrichedCompanies]
        : enrichedCompanies.filter((company) => company.sector === sectorFilter);

    switch (sortMode) {
      case "BLOAT SCORE":
        return scoped.sort((a, b) => {
          const scoreDiff = BLOAT_ORDER[a.bloat] - BLOAT_ORDER[b.bloat];
          if (scoreDiff !== 0) {
            return scoreDiff;
          }
          return a.revenuePerEmployee - b.revenuePerEmployee;
        });
      case "HEADCOUNT":
        return scoped.sort((a, b) => b.employees - a.employees);
      case "REV / EMPLOYEE":
        return scoped.sort((a, b) => a.revenuePerEmployee - b.revenuePerEmployee);
      case "MARKET CAP":
        return scoped.sort((a, b) => b.marketCap - a.marketCap);
      default:
        return scoped;
    }
  }, [enrichedCompanies, sectorFilter, sortMode]);

  const stats = useMemo(() => {
    const totalEmployees = d3.sum(filteredCompanies, (d) => d.employees);
    const bloatedCount = filteredCompanies.filter((d) => d.bloat === "bloated").length;

    const nonFinance = filteredCompanies.filter((d) => d.bloat !== "finance");
    const averageRevPerEmployee =
      nonFinance.length > 0 ? d3.mean(nonFinance, (d) => d.revenuePerEmployee) ?? 0 : 0;

    const mostBloated =
      nonFinance.length > 0
        ? [...nonFinance].sort((a, b) => a.revenuePerEmployee - b.revenuePerEmployee)[0]
        : null;

    return {
      totalEmployees,
      bloatedCount,
      averageRevPerEmployee,
      mostBloated
    };
  }, [filteredCompanies]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    let resizeTimeout: ReturnType<typeof setTimeout> | null = null;

    const updateDimensions = () => {
      if (!chartWrapRef.current) {
        return;
      }

      const rect = chartWrapRef.current.getBoundingClientRect();
      setDimensions({
        width: Math.max(320, Math.floor(rect.width)),
        height: Math.max(480, Math.floor(rect.height))
      });
    };

    updateDimensions();

    const handleResize = () => {
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }

      resizeTimeout = setTimeout(() => {
        updateDimensions();
      }, 150);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (!svgRef.current) {
      return;
    }

    const width = dimensions.width;
    const height = dimensions.height;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    svg.attr("width", width).attr("height", height).attr("viewBox", `0 0 ${width} ${height}`);

    if (filteredCompanies.length === 0) {
      svg
        .append("text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("fill", "var(--muted)")
        .attr("font-size", 14)
        .attr("font-family", "var(--font-mono)")
        .attr("text-anchor", "middle")
        .text("NO DATA FOR CURRENT FILTER");
      return;
    }

    const positionTooltip = (clientX: number, clientY: number) => {
      const tooltipWidth = 280;
      const tooltipHeight = 290;
      const padding = 12;

      return {
        x: Math.max(padding, Math.min(clientX + 18, window.innerWidth - tooltipWidth - padding)),
        y: Math.max(padding, Math.min(clientY + 18, window.innerHeight - tooltipHeight - padding))
      };
    };

    const showTooltip = (event: MouseEvent, company: CompanyWithMetrics) => {
      const nextPosition = positionTooltip(event.clientX, event.clientY);
      setTooltip({
        visible: true,
        x: nextPosition.x,
        y: nextPosition.y,
        company
      });
    };

    const hideTooltip = () => {
      setTooltip((current) => ({
        ...current,
        visible: false,
        company: null
      }));
    };

    if (viewMode === "BUBBLES") {
      const margin = { top: 24, right: 24, bottom: 24, left: 24 };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      const employeeExtent = d3.extent(filteredCompanies, (d) => d.employees);
      const radiusScale = d3
        .scaleSqrt()
        .domain([employeeExtent[0] ?? 1, employeeExtent[1] ?? 1])
        .range([12, Math.max(48, innerWidth / 6)]);

      const nodes: CompanyNode[] = filteredCompanies.map((company) => ({
        ...company,
        x: innerWidth / 2 + (Math.random() - 0.5) * 40,
        y: innerHeight / 2 + (Math.random() - 0.5) * 40
      }));

      const simulation = d3
        .forceSimulation(nodes)
        .force("center", d3.forceCenter(innerWidth / 2, innerHeight / 2))
        .force("x", d3.forceX(innerWidth / 2).strength(0.03))
        .force("y", d3.forceY(innerHeight / 2).strength(0.03))
        .force(
          "collision",
          d3
            .forceCollide<CompanyNode>()
            .radius((d) => radiusScale(d.employees) + 2)
            .iterations(3)
        )
        .stop();

      for (let index = 0; index < 200; index += 1) {
        simulation.tick();
      }

      const chart = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

      const groups = chart
        .selectAll("g.node")
        .data(nodes)
        .join("g")
        .attr("class", "node")
        .attr("transform", (d) => `translate(${d.x ?? 0}, ${d.y ?? 0})`)
        .on("mousemove", (event, d) => showTooltip(event as MouseEvent, d))
        .on("mouseleave", hideTooltip);

      groups
        .append("circle")
        .attr("r", (d) => radiusScale(d.employees))
        .attr("fill", (d) => getColor(d.bloat))
        .attr("fill-opacity", 0.75)
        .attr("stroke", (d) => getColor(d.bloat))
        .attr("stroke-width", 1)
        .attr("stroke-opacity", 1);

      groups
        .filter((d) => radiusScale(d.employees) > 16)
        .append("text")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", "#050505")
        .attr("font-family", "var(--font-display)")
        .attr("font-size", (d) => Math.min(22, Math.max(12, radiusScale(d.employees) / 2.3)))
        .attr("letter-spacing", "0.08em")
        .text((d) => d.ticker);
    }

    if (viewMode === "SCATTER") {
      const margin = { top: 42, right: 32, bottom: 82, left: 96 };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      const minEmployees = Math.max(1, d3.min(filteredCompanies, (d) => d.employees) ?? 1);
      const maxEmployees = d3.max(filteredCompanies, (d) => d.employees) ?? minEmployees * 10;

      const minRpe = Math.max(1, d3.min(filteredCompanies, (d) => d.revenuePerEmployee) ?? 1);
      const maxRpe = d3.max(filteredCompanies, (d) => d.revenuePerEmployee) ?? minRpe * 10;

      const xScale = d3
        .scaleLog()
        .domain([Math.max(1, minEmployees * 0.8), maxEmployees * 1.2])
        .range([0, innerWidth]);

      const yScale = d3
        .scaleLog()
        .domain([Math.max(1, minRpe * 0.8), maxRpe * 1.2])
        .range([innerHeight, 0]);

      const sizeScale = d3
        .scaleSqrt()
        .domain(d3.extent(filteredCompanies, (d) => d.marketCap) as [number, number])
        .range([4, 40]);

      const chart = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

      const xGrid = d3.axisBottom(xScale).ticks(8, "~s").tickSize(-innerHeight).tickFormat(() => "");
      const yGrid = d3.axisLeft(yScale).ticks(8, "~s").tickSize(-innerWidth).tickFormat(() => "");

      chart
        .append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(xGrid)
        .selectAll("line")
        .attr("stroke", "var(--border)")
        .attr("stroke-opacity", 0.75);

      chart
        .append("g")
        .call(yGrid)
        .selectAll("line")
        .attr("stroke", "var(--border)")
        .attr("stroke-opacity", 0.75);

      chart.selectAll(".domain").attr("stroke", "var(--border)");

      const xAxis = d3
        .axisBottom(xScale)
        .ticks(8, "~s")
        .tickFormat((value) => fmtEmp(Number(value)));

      const yAxis = d3
        .axisLeft(yScale)
        .ticks(8, "~s")
        .tickFormat((value) => fmt(Number(value)));

      chart
        .append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(xAxis)
        .selectAll("text")
        .attr("fill", "var(--muted)")
        .attr("font-family", "var(--font-mono)")
        .attr("font-size", 11);

      chart
        .append("g")
        .call(yAxis)
        .selectAll("text")
        .attr("fill", "var(--muted)")
        .attr("font-family", "var(--font-mono)")
        .attr("font-size", 11);

      chart
        .selectAll(".domain")
        .attr("stroke", "var(--border)")
        .attr("stroke-width", 1);

      const thresholdY = yScale(300_000);
      chart
        .append("line")
        .attr("x1", 0)
        .attr("x2", innerWidth)
        .attr("y1", thresholdY)
        .attr("y2", thresholdY)
        .attr("stroke", "var(--accent)")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "6 6");

      chart
        .append("text")
        .attr("x", 8)
        .attr("y", thresholdY - 8)
        .attr("fill", "var(--accent)")
        .attr("font-family", "var(--font-mono)")
        .attr("font-size", 11)
        .text("BLOAT THRESHOLD $300K");

      const points = chart
        .selectAll("g.point")
        .data(filteredCompanies)
        .join("g")
        .attr("class", "point")
        .attr(
          "transform",
          (d) => `translate(${xScale(d.employees)},${yScale(d.revenuePerEmployee)})`
        )
        .on("mousemove", (event, d) => showTooltip(event as MouseEvent, d))
        .on("mouseleave", hideTooltip);

      points
        .append("circle")
        .attr("r", (d) => sizeScale(d.marketCap))
        .attr("fill", (d) => getColor(d.bloat))
        .attr("fill-opacity", 0.72)
        .attr("stroke", (d) => getColor(d.bloat))
        .attr("stroke-width", 1)
        .attr("stroke-opacity", 1);

      points
        .filter((d) => d.marketCap > 200e9)
        .append("text")
        .attr("y", (d) => -sizeScale(d.marketCap) - 6)
        .attr("text-anchor", "middle")
        .attr("fill", "var(--text)")
        .attr("font-family", "var(--font-display)")
        .attr("font-size", 13)
        .attr("letter-spacing", "0.08em")
        .text((d) => d.ticker);

      svg
        .append("text")
        .attr("x", margin.left + innerWidth / 2)
        .attr("y", height - 22)
        .attr("text-anchor", "middle")
        .attr("fill", "var(--muted)")
        .attr("font-family", "var(--font-mono)")
        .attr("font-size", 12)
        .text("<- FEWER EMPLOYEES    HEADCOUNT    MORE EMPLOYEES ->");

      svg
        .append("text")
        .attr("x", margin.left)
        .attr("y", 20)
        .attr("fill", "var(--muted)")
        .attr("font-family", "var(--font-mono)")
        .attr("font-size", 12)
        .text("<- BLOATED    REVENUE / EMPLOYEE    LEAN ->");
    }

    if (viewMode === "RANKING") {
      const rankingData = filteredCompanies
        .filter((company) => company.bloat !== "finance")
        .sort((a, b) => a.revenuePerEmployee - b.revenuePerEmployee)
        .slice(0, 40);

      if (rankingData.length === 0) {
        svg
          .append("text")
          .attr("x", width / 2)
          .attr("y", height / 2)
          .attr("fill", "var(--muted)")
          .attr("font-size", 14)
          .attr("font-family", "var(--font-mono)")
          .attr("text-anchor", "middle")
          .text("NO NON-FINANCE COMPANIES FOR CURRENT FILTER");
        return;
      }

      const margin = { top: 36, right: 200, bottom: 70, left: 84 };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      const xScale = d3
        .scaleLinear()
        .domain([0, (d3.max(rankingData, (d) => d.revenuePerEmployee) ?? 0) * 1.08])
        .range([0, innerWidth]);

      const yScale = d3
        .scaleBand<string>()
        .domain(rankingData.map((d) => d.ticker))
        .range([0, innerHeight])
        .padding(0.18);

      const chart = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

      chart
        .append("g")
        .call(d3.axisLeft(yScale).tickSize(0))
        .selectAll("text")
        .attr("fill", "var(--text)")
        .attr("font-family", "var(--font-display)")
        .attr("font-size", 12)
        .attr("letter-spacing", "0.08em");

      chart
        .append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScale).ticks(6).tickFormat((value) => fmt(Number(value))))
        .selectAll("text")
        .attr("fill", "var(--muted)")
        .attr("font-family", "var(--font-mono)")
        .attr("font-size", 11);

      chart.selectAll(".domain").attr("stroke", "var(--border)");

      const thresholdX = xScale(300_000);
      chart
        .append("line")
        .attr("x1", thresholdX)
        .attr("x2", thresholdX)
        .attr("y1", 0)
        .attr("y2", innerHeight)
        .attr("stroke", "var(--accent)")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "6 6");

      chart
        .append("text")
        .attr("x", Math.min(innerWidth - 80, thresholdX + 6))
        .attr("y", -10)
        .attr("fill", "var(--accent)")
        .attr("font-family", "var(--font-mono)")
        .attr("font-size", 11)
        .text("BLOAT LINE");

      const rows = chart
        .selectAll("g.row")
        .data(rankingData)
        .join("g")
        .attr("class", "row")
        .attr("transform", (d) => `translate(0,${yScale(d.ticker) ?? 0})`)
        .on("mousemove", (event, d) => showTooltip(event as MouseEvent, d))
        .on("mouseleave", hideTooltip);

      rows
        .append("rect")
        .attr("height", yScale.bandwidth())
        .attr("width", (d) => xScale(d.revenuePerEmployee))
        .attr("fill", (d) => getColor(d.bloat))
        .attr("fill-opacity", 0.8);

      rows
        .append("text")
        .attr("x", (d) => xScale(d.revenuePerEmployee) + 8)
        .attr("y", yScale.bandwidth() / 2)
        .attr("dominant-baseline", "middle")
        .attr("fill", "var(--muted)")
        .attr("font-family", "var(--font-mono)")
        .attr("font-size", 10)
        .text((d) => `${fmt(d.revenuePerEmployee)} - ${fmtEmp(d.employees)} emp`);

      svg
        .append("text")
        .attr("x", margin.left + innerWidth / 2)
        .attr("y", height - 20)
        .attr("text-anchor", "middle")
        .attr("fill", "var(--muted)")
        .attr("font-family", "var(--font-mono)")
        .attr("font-size", 12)
        .text("REVENUE PER EMPLOYEE - LEAST EFFICIENT COMPANIES (EXCL. FINANCIALS)");
    }
  }, [dimensions.height, dimensions.width, filteredCompanies, viewMode]);

  return (
    <section className="mx-auto flex w-full max-w-[1400px] flex-col gap-5">
      <header className="space-y-2 border border-[var(--border)] bg-[var(--surface)] px-5 py-4">
        <h1 className="font-display text-5xl leading-none tracking-[0.14em] md:text-7xl">
          CORPORATE <span className="text-[var(--accent)]">BLOAT</span> INDEX
        </h1>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--muted)] md:text-sm">
          Public Company Headcount vs. Revenue Efficiency - 2024 Data
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <article className="border border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">
            Total Employees Shown
          </p>
          <p className="mt-2 font-display text-4xl leading-none">{fmtEmp(stats.totalEmployees)}</p>
        </article>
        <article className="border border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">
            Companies Flagged Bloated
          </p>
          <p className="mt-2 font-display text-4xl leading-none text-[var(--accent)]">
            {stats.bloatedCount}
          </p>
        </article>
        <article className="border border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">
            Avg Rev/Employee
          </p>
          <p className="mt-2 font-display text-4xl leading-none">{fmt(stats.averageRevPerEmployee)}</p>
        </article>
        <article className="border border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">
            Most Bloated Ticker
          </p>
          <p className="mt-2 font-display text-4xl leading-none text-[var(--accent)]">
            {stats.mostBloated?.ticker ?? "N/A"}
          </p>
        </article>
      </div>

      <div className="flex flex-col gap-3 border border-[var(--border)] bg-[var(--surface)] px-4 py-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-3">
          <label className="flex items-center gap-2">
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">
              Sector
            </span>
            <select
              value={sectorFilter}
              onChange={(event) => setSectorFilter(event.target.value)}
              className="border border-[var(--border)] bg-[var(--bg)] px-2 py-1 font-mono text-xs uppercase tracking-[0.08em] text-[var(--text)] outline-none"
            >
              {sectors.map((sector) => (
                <option key={sector} value={sector}>
                  {sector}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-2">
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">
              Sort
            </span>
            <select
              value={sortMode}
              onChange={(event) => setSortMode(event.target.value as SortMode)}
              className="border border-[var(--border)] bg-[var(--bg)] px-2 py-1 font-mono text-xs uppercase tracking-[0.08em] text-[var(--text)] outline-none"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-center gap-1 border border-[var(--border)] bg-[var(--bg)] p-1">
            {VIEW_OPTIONS.map((mode) => {
              const isActive = mode === viewMode;
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em] transition ${
                    isActive
                      ? "bg-[var(--accent)] text-black"
                      : "text-[var(--muted)] hover:text-[var(--text)]"
                  }`}
                >
                  {mode}
                </button>
              );
            })}
          </div>
        </div>

        <div className="ml-auto flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">
          <span className="inline-flex items-center gap-2">
            <i className="h-2.5 w-2.5 rounded-full bg-[var(--green)]" /> LEAN
          </span>
          <span className="inline-flex items-center gap-2">
            <i className="h-2.5 w-2.5 rounded-full bg-[var(--yellow)]" /> NORMAL
          </span>
          <span className="inline-flex items-center gap-2">
            <i className="h-2.5 w-2.5 rounded-full bg-[var(--accent)]" /> BLOATED
          </span>
          <span className="inline-flex items-center gap-2">
            <i className="h-2.5 w-2.5 rounded-full bg-[var(--blue)]" /> FINANCIALS
          </span>
        </div>
      </div>

      <div
        ref={chartWrapRef}
        className="relative h-[560px] border border-[var(--border)] bg-[var(--surface)] md:h-[700px]"
      >
        <svg ref={svgRef} className="h-full w-full" />
      </div>

      {tooltip.visible && tooltip.company ? (
        <div
          className="pointer-events-none fixed z-[1100] min-w-[240px] border border-[var(--border)] border-l-[3px] border-l-[var(--accent)] bg-[rgba(8,8,10,0.96)] p-3"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <p
            className="font-display text-[28px] leading-none"
            style={{ color: getColor(tooltip.company.bloat) }}
          >
            {tooltip.company.ticker}
          </p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">
            {tooltip.company.name} - {tooltip.company.sector}
          </p>

          <div className="mt-3 space-y-1 font-mono text-[11px]">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-1">
              <span className="text-[var(--muted)]">EMPLOYEES</span>
              <span>{fmtEmp(tooltip.company.employees)}</span>
            </div>
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-1">
              <span className="text-[var(--muted)]">REVENUE</span>
              <span>{fmt(tooltip.company.revenue)}</span>
            </div>
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-1">
              <span className="text-[var(--muted)]">MARKET CAP</span>
              <span>{fmt(tooltip.company.marketCap)}</span>
            </div>
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-1">
              <span className="text-[var(--muted)]">REV/EMPLOYEE</span>
              <span style={{ color: getColor(tooltip.company.bloat) }}>
                {fmt(tooltip.company.revenuePerEmployee)}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-1">
              <span className="text-[var(--muted)]">EFFICIENCY RATIO</span>
              <span>{((tooltip.company.revenue / tooltip.company.marketCap) * 100).toFixed(1)}%</span>
            </div>
          </div>

          <div className="mt-3">
            <span
              className="inline-flex rounded-full px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-black"
              style={{ backgroundColor: getColor(tooltip.company.bloat) }}
            >
              Bloat Score: {getBadgeLabel(tooltip.company.bloat)}
            </span>
          </div>
        </div>
      ) : null}
    </section>
  );
}
