import {GraphNode} from "@/types/GraphNode";
import {GraphEdge} from "@/types/GraphEdge";

export interface GraphState {
    nodes: GraphNode[]
    edges: GraphEdge[]
}
