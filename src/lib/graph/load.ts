// src/lib/graph/load.ts — the one way a page reaches the graph.
//
// Pages read the COMMITTED artifact (src/data/graph/graph.json), never the derivation: the
// build side (build.ts) touches the filesystem, and what the site shows must be the thing that
// is in git and dated by git. graph.test.ts is what guarantees the two agree.

import raw from '../../data/graph/graph.json'
import type { KnowledgeGraph } from './types'

export const GRAPH = raw as unknown as KnowledgeGraph
