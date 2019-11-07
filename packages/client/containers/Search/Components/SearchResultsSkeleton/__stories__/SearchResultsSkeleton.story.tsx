import { SearchResultsSkeleton } from "Apps/Search/Components/SearchResultsSkeleton"
import React from "react"
import { storiesOf } from "storybook/storiesOf"

storiesOf("Apps/Search/Components", module).add(
  "Search Results Skeleton",
  () => <SearchResultsSkeleton />
)
