# Atlas

A small geography lookup tool for the travel desk's shell scripts and editor plugins, which run it many times a minute.

```
atlas capital <country>...      capital city of each country
atlas currency <country>...     currency code and name
atlas zone <country>            UTC offset now for the country's main time zone
atlas nearest <lat> <lon>       nearest place in the gazetteer
atlas route <from> <to>         great-circle distance between two capitals
atlas help                      this list
```

`npm run perf` starts the tool repeatedly with a typical `capital` lookup and prints JSON timings. `npm test` runs the tests.
