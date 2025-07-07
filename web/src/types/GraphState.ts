import {GraphNode} from "@/src/types/GraphNode";
import {GraphEdge} from "@/src/types/GraphEdge";


export interface GraphState {
    nodes: GraphNode[]
    edges: GraphEdge[]
}
