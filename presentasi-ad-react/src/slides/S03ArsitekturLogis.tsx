import { useState } from 'react';
import { Prose } from '../components/Prose';
import { TREE, TREE_DEFAULT_INFO, TREE_INFO, type TreeNode } from '../content/treeInfo';

const NODE_INDEX: ReadonlyMap<string, TreeNode> = buildIndex(TREE);

function buildIndex(nodes: readonly TreeNode[]): Map<string, TreeNode> {
  const map = new Map<string, TreeNode>();
  const walk = (list: readonly TreeNode[]): void => {
    for (const node of list) {
      map.set(node.id, node);
      if (node.children) walk(node.children);
    }
  };
  walk(nodes);
  return map;
}

type TreeItemProps = {
  node: TreeNode;
  selectedId: string | null;
  folded: ReadonlySet<string>;
  onSelect: (node: TreeNode) => void;
  onToggleFold: (id: string) => void;
};

function TreeItem({ node, selectedId, folded, onSelect, onToggleFold }: TreeItemProps) {
  const hasChildren = Boolean(node.children?.length);
  const isFolded = folded.has(node.id);
  const isSelected = selectedId === node.id;

  const classes = [
    'node',
    `lv-${node.level}`,
    node.openTarget ? 'open-target' : undefined,
    isSelected ? 'selected' : undefined,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <li className={isFolded ? 'folded' : undefined}>
      {hasChildren && (
        <button
          type="button"
          className="fold"
          title={isFolded ? 'Buka cabang' : 'Lipat cabang'}
          aria-label={isFolded ? 'Buka cabang' : 'Lipat cabang'}
          aria-expanded={!isFolded}
          onClick={(event) => {
            event.stopPropagation();
            onToggleFold(node.id);
          }}
        >
          {isFolded ? '+' : '−'}
        </button>
      )}

      <button type="button" className={classes} onClick={() => onSelect(node)}>
        {node.label}
        {node.note && <small>{node.note}</small>}
      </button>

      {node.children && (
        <ul>
          {node.children.map((child) => (
            <TreeItem
              key={child.id}
              node={child}
              selectedId={selectedId}
              folded={folded}
              onSelect={onSelect}
              onToggleFold={onToggleFold}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export function S03ArsitekturLogis() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [folded, setFolded] = useState<ReadonlySet<string>>(() => new Set<string>());

  const selectedNode = selectedId ? NODE_INDEX.get(selectedId) : undefined;
  const info = selectedNode ? TREE_INFO[selectedNode.info] : undefined;

  const toggleFold = (id: string): void => {
    setFolded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="slide-inner">
      <header className="slide-head">
        <span className="kicker">02 · Arsitektur — Komponen Logis</span>
        <h2 data-reveal>
          Hierarki Logis AD <span className="tag-live">● klik nodanya</span>
        </h2>
      </header>

      <div className="cols tree-cols">
        <div className="col" data-reveal>
          <ul className="tree">
            {TREE.map((node) => (
              <TreeItem
                key={node.id}
                node={node}
                selectedId={selectedId}
                folded={folded}
                onSelect={(n) => setSelectedId(n.id)}
                onToggleFold={toggleFold}
              />
            ))}
          </ul>
          <p className="mini hint-fold">Klik ⊕/⊖ untuk melipat cabang · klik node untuk membaca definisinya →</p>
        </div>

        <aside className="col info-panel" data-reveal>
          <h3>{info?.title ?? TREE_DEFAULT_INFO.title}</h3>
          <Prose as="p" html={info?.body ?? TREE_DEFAULT_INFO.body} />
          <div className="info-foot">
            {info?.tags.map((tag) => (
              <span key={tag} className="chip">
                {tag}
              </span>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
