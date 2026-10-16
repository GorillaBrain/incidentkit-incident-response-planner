import React, { useState, useMemo } from 'react'
import { CYBERSECURITY_GLOSSARY } from '../../constants/glossary'
import { Search, BookMarked } from 'lucide-react'

export const GlossaryView: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Concepts', 'Threats', 'Defense & Tooling', 'Forensics', 'Governance & Legal'];

  const filteredTerms = useMemo(() => {
    return CYBERSECURITY_GLOSSARY.filter((item) => {
      if (selectedCategory !== 'All' && item.category !== selectedCategory) {
        return false;
      }
      if (search) {
        const q = search.toLowerCase();
        const matchTerm = item.term.toLowerCase().includes(q);
        const matchAcr = item.acronym?.toLowerCase().includes(q);
        const matchDef = item.definition.toLowerCase().includes(q);
        const matchEx = item.exampleOrContext.toLowerCase().includes(q);
        if (!matchTerm && !matchAcr && !matchDef && !matchEx) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => a.term.localeCompare(b.term));
  }, [search, selectedCategory]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <BookMarked className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Cybersecurity Operations & Forensics Glossary
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Essential technical terms, acronyms, and practical context for security operations and incident handlers
            </p>
          </div>
        </div>
      </div>

      {/* Search & Category Filter Controls */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search terms, acronyms (e.g. EDR, C2, AiTM), or definitions..."
            className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Terms Count */}
      <div className="text-xs text-slate-400 px-1">
        Showing <strong>{filteredTerms.length}</strong> of {CYBERSECURITY_GLOSSARY.length} terms
      </div>

      {/* Grid of Glossary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTerms.map((item, idx) => (
          <div
            key={idx}
            className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-slate-700 transition-all space-y-2.5"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-bold text-white">
                    {item.term}
                  </h3>
                  {item.acronym && (
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 font-semibold">
                      {item.acronym}
                    </span>
                  )}
                </div>
              </div>

              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 shrink-0">
                {item.category}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {item.definition}
            </p>

            <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
              <strong className="text-slate-400 font-medium">Example / Context: </strong>
              <span className="text-slate-300">{item.exampleOrContext}</span>
            </div>
          </div>
        ))}

        {filteredTerms.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 text-xs">
            No terms match your search query.
          </div>
        )}
      </div>
    </div>
  );
};
