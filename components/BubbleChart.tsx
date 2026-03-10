"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";

import { EFFICIENCY_COLORS, MOMENTUM_COLORS, RISK_COLORS } from "@/lib/constants";
import { formatEmployees, formatMoney, formatScore, formatSignedPercent } from "@/lib/formatters";
import type { Company, Mode } from "@/types/company";

type BubbleChartProps = {
  companies: Company[];
  mode: Mode;
  selectedSymbol: string | null;
  reportSymbols: Set<string>;
  onSelectCompany: (company: Company) => void;
  onAddToReport: (company: Company) => void;
};

type TooltipState = {
  visible: boolean;
  x: number;
  y: number;
  company: Company | null;
};

type NodeDatum = Company & d3.SimulationNodeDatum;

function bubbleColor(company: Company, mode: Mode): string {
  if (mode === "workforce") {
    return MOMENTUM_COLORS[company.workforceMomentum ?? "Balanced growth"];
  }
  if (mode === "supply") {
    return RISK_COLORS[company.supplyChainRiskLabel ?? "Medium"];
  }
  return EFFICIENCY_COLORS[company.efficiencyLabel ?? "Normal"];
}

export default function BubbleChart({
  companies,
  mode,
  selectedSymbol,
  reportSymbols,
  onSelectCompany,
  onAddToReport
}: BubbleChartProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const chartWrapRef = useRef<HTMLDivElement | null>(null);

  const [dimensions, setDimensions] = useState({ width: 960, height: 620 });
  const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, x: 0, y: 0, company: null });

  const valuesForSizing = useMemo(
    () => companies.map((company) => company.marketCap ?? company.revenue ?? 0).filter((value) => value > 0),
    [companies]
  );

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
      setDimensions({ width: Math.max(320, Math.floor(rect.width)), height: Math.max(480, Math.floor(rect.height)) });
    };

    updateDimensions();

    const handleResize = () => {
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
      resizeTimeout = setTimeout(updateDimensions, 150);
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
    if (!svgRef.current || companies.length === 0) {
      return;
    }

    const width = dimensions.width;
    const height = dimensions.height;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    svg.attr("width", width).attr("height", height).attr("viewBox", `0 0 ${width} ${height}`);

    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const canvasWidth = Math.max(innerWidth * 1.8, innerWidth + 420);
    const canvasHeight = Math.max(innerHeight * 1.7, innerHeight + 280);

    const sizeDomain = d3.extent(valuesForSizing) as [number, number];
    const radiusScale = d3
      .scaleSqrt()
      .domain([sizeDomain[0] || 1, sizeDomain[1] || 1])
      .range([10, Math.max(42, innerWidth / 7)]);

    const nodes: NodeDatum[] = companies.map((company) => ({
      ...company,
      x: canvasWidth / 2 + (Math.random() - 0.5) * 60,
      y: canvasHeight / 2 + (Math.random() - 0.5) * 60
    }));

    const simulation = d3
      .forceSimulation(nodes)
      .force("center", d3.forceCenter(canvasWidth / 2, canvasHeight / 2))
      .force("x", d3.forceX(canvasWidth / 2).strength(0.03))
      .force("y", d3.forceY(canvasHeight / 2).strength(0.03))
      .force(
        "collision",
        d3
          .forceCollide<NodeDatum>()
          .radius((d) => radiusScale(d.marketCap ?? d.revenue ?? 0) + 2)
          .iterations(3)
      )
      .stop();

    for (let index = 0; index < 220; index += 1) {
      simulation.tick();
    }

    const chart = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
    const bubbleLayer = chart.append("g");

    const positionTooltip = (clientX: number, clientY: number) => {
      const tooltipWidth = 320;
      const tooltipHeight = 250;
      const padding = 12;

      return {
        x: Math.max(padding, Math.min(clientX + 16, window.innerWidth - tooltipWidth - padding)),
        y: Math.max(padding, Math.min(clientY + 16, window.innerHeight - tooltipHeight - padding))
      };
    };

    const groups = bubbleLayer
      .selectAll("g.node")
      .data(nodes)
      .join("g")
      .attr("class", "node")
      .attr("transform", (d) => `translate(${d.x ?? 0}, ${d.y ?? 0})`)
      .on("mousemove", (event, d) => {
        const next = positionTooltip((event as MouseEvent).clientX, (event as MouseEvent).clientY);
        setTooltip({ visible: true, x: next.x, y: next.y, company: d });
      })
      .on("mouseleave", () => setTooltip((current) => ({ ...current, visible: false, company: null })))
      .on("click", (_, d) => onSelectCompany(d));

    groups
      .append("circle")
      .attr("r", (d) => radiusScale(d.marketCap ?? d.revenue ?? 0))
      .attr("fill", (d) => bubbleColor(d, mode))
      .attr("fill-opacity", 0.78)
      .attr("stroke", (d) => (d.symbol === selectedSymbol ? "#ffffff" : bubbleColor(d, mode)))
      .attr("stroke-width", (d) => (d.symbol === selectedSymbol ? 3 : 1.1))
      .attr("filter", (d) => (d.symbol === selectedSymbol ? "drop-shadow(0 0 12px rgba(255,255,255,0.45))" : "none"));

    groups
      .filter((d) => radiusScale(d.marketCap ?? d.revenue ?? 0) > 16)
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("fill", "#080808")
      .attr("font-family", "var(--font-display)")
      .attr("font-size", (d) => Math.min(22, Math.max(10, radiusScale(d.marketCap ?? d.revenue ?? 0) / 2.3)))
      .attr("letter-spacing", "0.08em")
      .text((d) => d.symbol);

    const minScale = Math.max(0.45, Math.min(innerWidth / canvasWidth, innerHeight / canvasHeight));
    const initialTransform = d3.zoomIdentity
      .translate((innerWidth - canvasWidth * minScale) / 2, (innerHeight - canvasHeight * minScale) / 2)
      .scale(minScale);

    const zoomBehavior = d3
      .zoom<SVGGElement, unknown>()
      .scaleExtent([minScale, 2.5])
      .extent([
        [0, 0],
        [innerWidth, innerHeight]
      ])
      .translateExtent([
        [0, 0],
        [canvasWidth, canvasHeight]
      ])
      .on("zoom", (event) => {
        bubbleLayer.attr("transform", event.transform.toString());
      });

    chart
      .call(zoomBehavior)
      .call(zoomBehavior.transform, initialTransform)
      .on("dblclick.zoom", null)
      .style("cursor", "grab");

    chart
      .on("mousedown", () => chart.style("cursor", "grabbing"))
      .on("mouseup", () => chart.style("cursor", "grab"))
      .on("mouseleave", () => chart.style("cursor", "grab"));

    svg
      .append("text")
      .attr("x", margin.left + innerWidth - 8)
      .attr("y", margin.top + innerHeight - 8)
      .attr("text-anchor", "end")
      .attr("fill", "var(--muted)")
      .attr("font-family", "var(--font-mono)")
      .attr("font-size", 10)
      .text("SCROLL TO ZOOM - DRAG TO PAN");
  }, [companies, dimensions.height, dimensions.width, mode, onSelectCompany, selectedSymbol, valuesForSizing]);

  return (
    <section className="border border-[var(--border)] bg-[var(--surface)]">
      <header className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
        <h2 className="font-display text-3xl tracking-[0.08em]">Market Bubble Map</h2>
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">
          Bubble size by market cap
        </p>
      </header>

      <div ref={chartWrapRef} className="relative h-[540px] md:h-[680px]">
        <svg ref={svgRef} className="h-full w-full" />
      </div>

      {tooltip.visible && tooltip.company ? (
        <div
          className="fixed z-[1100] min-w-[260px] border border-[var(--border)] border-l-[3px] border-l-[var(--accent)] bg-[rgba(8,8,10,0.96)] p-3"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <p className="font-display text-[26px] leading-none">{tooltip.company.symbol}</p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">
            {tooltip.company.name} - {tooltip.company.sector}
          </p>
          <div className="mt-3 space-y-1 font-mono text-[11px]">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-1">
              <span className="text-[var(--muted)]">Revenue / Employee</span>
              <span>{formatMoney(tooltip.company.revenuePerEmployee)}</span>
            </div>
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-1">
              <span className="text-[var(--muted)]">Workforce Momentum</span>
              <span>{tooltip.company.workforceMomentum}</span>
            </div>
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-1">
              <span className="text-[var(--muted)]">Growth Gap</span>
              <span>{formatSignedPercent(tooltip.company.growthGap)}</span>
            </div>
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-1">
              <span className="text-[var(--muted)]">Supply Risk</span>
              <span>
                {formatScore(tooltip.company.supplyChainRiskScore)} ({tooltip.company.supplyChainRiskLabel})
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--muted)]">Employees</span>
              <span>{formatEmployees(tooltip.company.employees)}</span>
            </div>
          </div>
          <button
            type="button"
            disabled={reportSymbols.has(tooltip.company.symbol)}
            onClick={() => onAddToReport(tooltip.company as Company)}
            className={`mt-3 w-full border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] ${
              reportSymbols.has(tooltip.company.symbol)
                ? "border-[var(--border)] text-[var(--muted)]"
                : "border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-black"
            }`}
          >
            {reportSymbols.has(tooltip.company.symbol) ? "Added to Report" : "+ Add to Report"}
          </button>
        </div>
      ) : null}
    </section>
  );
}
