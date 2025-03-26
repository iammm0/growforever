import {GraphNode} from "@/models/GraphNode";
import {GraphEdge} from "@/models/GraphEdge";

export interface GraphState {
    nodes: GraphNode[]
    edges: GraphEdge[]
}
