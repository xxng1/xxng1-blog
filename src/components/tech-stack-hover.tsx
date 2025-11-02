"use client";

interface TechStackItem {
  name: string;
  description: string;
}

interface TechStackGroupProps {
  title: string;
  items: TechStackItem[];
}

export default function TechStackGroup({ title, items }: TechStackGroupProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-foreground mb-3">{title}</h3>
      <div className="flex flex-wrap gap-3">
        {items.map((item) => (
          <div
            key={item.name}
            className="group relative"
          >
            <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm font-medium border border-accent/20 cursor-help hover:bg-accent/20 transition-colors">
              {item.name}
            </span>
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-foreground text-background text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50 shadow-xl max-w-xs w-max">
              <div className="whitespace-normal text-left leading-relaxed">
                {item.description}
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-foreground"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

