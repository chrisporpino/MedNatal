import { Injectable } from '@angular/core';
import * as d3 from 'd3';
import { FetalGrowthPercentile, EcoData } from './patient-data.service';

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

  createGrowthChart(
    element: HTMLElement,
    patientData: EcoData[],
    percentileData: FetalGrowthPercentile[]
  ): void {
    if (!element || !patientData || patientData.length === 0 || !percentileData || percentileData.length === 0) {
      return;
    }

    d3.select(element).select('svg').remove();

    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const width = element.clientWidth - margin.left - margin.right;
    const height = element.clientHeight - margin.top - margin.bottom;

    const svg = d3.select(element)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const allWeights = [
      // FIX: Use `estimated_fetal_weight_grams` property from `EcoData` interface.
      ...patientData.map(d => d.estimated_fetal_weight_grams),
      ...percentileData.map(d => d.p10),
      ...percentileData.map(d => d.p90)
    ];

    const x = d3.scaleLinear()
      .domain([d3.min(percentileData, d => d.week) as number, d3.max(percentileData, d => d.week) as number])
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(allWeights) as number + 200])
      .range([height, 0]);

    // Axes
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).tickSizeOuter(0))
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick text").attr("fill", "#6b7280").style("font-size", "12px"));

    svg.append('g')
      .call(d3.axisLeft(y).ticks(5).tickSizeOuter(0))
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick text").attr("fill", "#6b7280").style("font-size", "12px"));
      
    // Axis Labels
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 5)
        .text("Idade Gestacional (Semanas)")
        .style("font-size", "12px")
        .attr("fill", "#374151");

    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 15)
        .attr("x", -height / 2)
        .text("Peso Fetal Estimado (g)")
        .style("font-size", "12px")
        .attr("fill", "#374151");


    // Percentile area (P10-P90 band)
    const area = d3.area<FetalGrowthPercentile>()
      .x(d => x(d.week))
      .y0(d => y(d.p10))
      .y1(d => y(d.p90))
      .curve(d3.curveMonotoneX);

    svg.append('path')
      .datum(percentileData)
      .attr('fill', '#f3f4f6') // gray-100
      .attr('d', area);

    // P50 line
    const p50line = d3.line<FetalGrowthPercentile>()
      .x(d => x(d.week))
      .y(d => y(d.p50))
      .curve(d3.curveMonotoneX);

    svg.append('path')
      .datum(percentileData)
      .attr('fill', 'none')
      .attr('stroke', '#d1d5db') // gray-300
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '4 4')
      .attr('d', p50line);

    // Patient data line
    const patientLine = d3.line<EcoData>()
      // FIX: Use `gestational_age_weeks` property from `EcoData` interface.
      .x(d => x(d.gestational_age_weeks))
      // FIX: Use `estimated_fetal_weight_grams` property from `EcoData` interface.
      .y(d => y(d.estimated_fetal_weight_grams))
      .curve(d3.curveMonotoneX);

    svg.append('path')
      .datum(patientData)
      .attr('fill', 'none')
      .attr('stroke', '#0d9488') // teal-600
      .attr('stroke-width', 2.5)
      .attr('d', patientLine);

    // Patient data points
    svg.selectAll('patient-dots')
      .data(patientData)
      .enter()
      .append('circle')
      // FIX: Use `gestational_age_weeks` property from `EcoData` interface.
      .attr('cx', d => x(d.gestational_age_weeks))
      // FIX: Use `estimated_fetal_weight_grams` property from `EcoData` interface.
      .attr('cy', d => y(d.estimated_fetal_weight_grams))
      .attr('r', 5)
      .attr('fill', '#0d9488')
      .attr('stroke', 'white')
      .attr('stroke-width', 2);
  }
}