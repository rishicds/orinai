"use client";

import { MermaidRenderer } from "@/components/charts/MermaidRenderer";

const testDiagrams = [
  {
    title: "Simple Flowchart",
    diagram: `flowchart TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Fix it]
    D --> B`
  },
  {
    title: "Process Flow",
    diagram: `graph LR
    A[Input] --> B[Process]
    B --> C[Output]
    C --> D[End]`
  }
];

export default function TestMermaidPage() {
  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-8">Mermaid Diagram Test</h1>
        
        <div className="space-y-8">
          {testDiagrams.map((test, index) => (
            <div key={index} className="bg-slate-900 rounded-xl p-6">
              <h2 className="text-xl text-white mb-4">{test.title}</h2>
              <MermaidRenderer 
                diagram={test.diagram}
                title={test.title}
                className="h-64"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}