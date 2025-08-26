import {useCallback} from 'react'
import {createSeed, expandSeed, expandNode, createNode} from '@/lib/api'
import {SeedCreateRequest, ExpandRequest} from '@/lib/seed'
import {NodeCreateRequest} from '@/lib/node'

export function useSeedApi() {
    const create = useCallback((data: SeedCreateRequest) => createSeed(data), [])
    const expandSeedFn = useCallback(
        (seedId: number, data: ExpandRequest) => expandSeed(seedId, data),
        [],
    )
    const expandNodeFn = useCallback(
        (seedId: number, nodeId: number, data: ExpandRequest) => expandNode(seedId, nodeId, data),
        [],
    )
    const createNodeFn = useCallback(
        (seedId: number, data: NodeCreateRequest) => createNode(seedId, data),
        [],
    )

    return { createSeed: create, expandSeed: expandSeedFn, expandNode: expandNodeFn, createNode: createNodeFn }
}
