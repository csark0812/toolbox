# Exam grades

Mock exam results for Year 11 chemistry at Hillcrest School. `data/marks.csv` has each candidate's marks on the two papers, each out of 100; a candidate who missed a paper has `ABS`.

A candidate's percentage is their total over 200. It is rounded to the nearest whole number before grading, so 69.5% counts as 70%. Grades: A from 70%, B from 60%, C from 50%, D from 40%, otherwise U. A candidate absent for either paper is graded X.

## Usage

```
npm run grades   # every candidate's percentage and grade
npm test
```
