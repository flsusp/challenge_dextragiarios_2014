#!/bin/bash

for i in $(seq 1 1000)
do
   nodejs load/parallel.js &
   if (( $i % 10 == 0 )); then wait; fi
done
wait

nodejs load/parallel_result.js
