import { Injectable } from '@angular/core';
import * as d3 from 'd3';

@Injectable()
export class D3Service {
  createLineChart(
    element: HTMLElement,
    data: any[],
    xField: string,
    yField: string,
    lineColor: string
  ): void {
    if (!element || !data || data.length === 0) {
      return;
    }

    d3.select(element).select('svg').remove();

    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const width = element.clientWidth - margin.left - margin.right;
    const height = element.clientHeight - margin.top - margin.bottom;

    const svg = d3
      .select(element)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3
      .scaleLinear()
      .domain(d3.extent(data, (d: any) => d[xField]) as [number, number])
      .range([0, width]);

    const y = d3
      .scaleLinear()
      .domain([
        d3.min(data, (d: any) => d[yField]) as number - 2,
        d3.max(data, (d: any) => d[yField]) as number + 2,
      ])
      .range([height, 0]);

    svg
      .append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(5).tickSizeOuter(0))
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick line").attr("stroke", "#e5e7eb"))
      .call(g => g.selectAll(".tick text").attr("fill", "#6b7280").style("font-size", "12px"));

    svg
      .append('g')
      .call(d3.axisLeft(y).ticks(5).tickSizeOuter(0))
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick line").attr("stroke", "#e5e7eb"))
      .call(g => g.selectAll(".tick text").attr("fill", "#6b7280").style("font-size", "12px"));

    const line = d3
      .line()
      .x((d: any) => x(d[xField]))
      .y((d: any) => y(d[yField]))
      .curve(d3.curveMonotoneX);

    svg
      .append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', lineColor)
      .attr('stroke-width', 2.5)
      .attr('d', line as any);

    svg
      .selectAll('dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', (d: any) => x(d[xField]))
      .attr('cy', (d: any) => y(d[yField]))
      .attr('r', 4)
      .attr('fill', lineColor);
  }
}
