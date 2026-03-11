"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import dynamic from "next/dynamic";
import { Network, Search, AlertCircle, RefreshCw } from "lucide-react";

// Dynamically import react-force-graph-2d because it accesses the window object and Canvas API, which breaks SSR.
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
});

export default function GraphPage() {
  const [graphData, setGraphData] = useState<{ nodes: any[]; links: any[] }>({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  const containerRef = useRef<HTMLDivElement>(null);

  // Responsive graph sizing
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };

    window.addEventListener("resize", updateDimensions);
    updateDimensions();

    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const fetchGraphData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/graph-data");
      const data = await res.json();

      if (data.error) throw new Error(data.error);

      if (data.nodes.length === 0) {
        // Fallback demo data if DB is empty
        setGraphData({
          nodes: [
            { id: "1", name: "No Analyzed Cases Found. Generate an AI Brief on the Home page first!", group: 1, val: 20 },
            { id: "A", name: "Roe v. Wade", group: 2, val: 10 },
            { id: "B", name: "Brown v. Board", group: 2, val: 10 }
          ],
          links: [
            { source: "1", target: "A" },
            { source: "1", target: "B" }
          ]
        });
      } else {
        setGraphData(data);
      }
    } catch (err: any) {
      console.error(err);
      setError("Failed to load map topology data.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchGraphData();
  }, []);

  return (
    <div className="min-h-screen bg-[#030712] pt-32 pb-8 px-4 sm:px-6 flex flex-col">
      <div className="max-w-7xl mx-auto w-full flex-grow flex flex-col space-y-6">

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center justify-center p-3 bg-indigo-500/10 rounded-full mb-3 ring-1 ring-indigo-500/30">
              <Network size={24} className="text-indigo-400" />
            </div>
            <h1 className="text-3xl font-bold text-white">Case Linkage Topology</h1>
            <p className="text-gray-400 mt-1 max-w-xl">
              An interactive web mapping the relationships between recent legal events and the historical precedents they cite. Automatically populated by the AI Brief engine.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={fetchGraphData} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition flex items-center gap-2 text-sm text-gray-300">
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Resync Database
            </button>
          </div>
        </div>

        {error && (
          <div className="w-full bg-red-500/10 border border-red-500/30 p-4 rounded-xl flex items-center gap-3 text-red-400">
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center gap-6 bg-white/5 border border-white/10 px-6 py-3 rounded-2xl w-max backdrop-blur-sm">
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <span className="w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]"></span> Evaluated Article
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <span className="w-3 h-3 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)]"></span> Cited Precedent
          </div>
        </div>

        {/* 2D Map Container */}
        <div
          ref={containerRef}
          className="w-full flex-grow min-h-[500px] lg:min-h-[600px] border border-white/10 rounded-3xl overflow-hidden relative bg-[#0B1221]/50 backdrop-blur-xl group cursor-grab active:cursor-grabbing"
        >
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm z-10">
              <Network size={48} className="text-indigo-500 animate-pulse mb-4 opacity-50" />
              <p className="text-indigo-300 font-medium tracking-widest text-sm">CALCULATING PHYSICS...</p>
            </div>
          ) : (
            <ForceGraph2D
              width={dimensions.width}
              height={dimensions.height}
              graphData={graphData}
              nodeColor={node => node.group === 1 ? "#6366f1" : "#f97316"}
              nodeRelSize={4}
              linkDirectionalParticles={2}
              linkDirectionalParticleWidth={1.5}
              linkDirectionalParticleSpeed={0.005}
              linkColor={() => "rgba(255,255,255,0.15)"}
              backgroundColor="rgba(0,0,0,0)"
              nodeCanvasObject={(node: any, ctx, globalScale) => {
                const label = node.name;
                const fontSize = 12 / globalScale;
                ctx.font = `${fontSize}px Sans-Serif`;
                const textWidth = ctx.measureText(label).width;
                const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2);

                ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
                ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, bckgDimensions[0], bckgDimensions[1]);

                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillStyle = node.group === 1 ? "#818cf8" : "#fb923c"; // Lighter text color inside
                ctx.fillText(label, node.x, node.y);

                node.__bckgDimensions = bckgDimensions; // to re-use in nodePointerAreaPaint
              }}
              nodePointerAreaPaint={(node: any, color, ctx) => {
                ctx.fillStyle = color;
                const bckgDimensions = node.__bckgDimensions;
                bckgDimensions && ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, bckgDimensions[0], bckgDimensions[1]);
              }}
              onNodeClick={(node: any) => {
                // Center camera on node
              }}
            />
          )}
        </div>

      </div>
    </div>
  );
}
