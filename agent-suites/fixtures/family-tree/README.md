# Family tree

The Hollins family history society's tree. `data/people.json` lists everyone with their mother and father (`null` where the parish records run out). Cousins marrying cousins happens, so one ancestor can be reached by more than one route.

`kinship(people, a, b)` finds how two people are related through their nearest common ancestor: the shared ancestor with the fewest generations in total between them (`up` from `a`, `down` from `b`). On a tie, the one closer to `a` wins, then the lower id. A person is their own ancestor at zero generations, so for a parent and child the parent is the common ancestor. It returns `null` for people with no shared ancestor, and throws for an id that is not in the tree.

## Usage

```
npm run kin -- P07 P11   # how two people are related
npm run perf             # times a batch of look-ups on the society's full tree
npm test
```
