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
    if (!element || !patientData || !percentileData || percentileData.length === 0) {
      return;
    }

    d3.select(element).select('svg').remove();
    d3.select('.d3-tooltip').remove();

    const margin = { top: 30, right: 60, bottom: 50, left: 60 };
    const width = element.clientWidth - margin.left - margin.right;
    const height = element.clientHeight - margin.top - margin.bottom;

    if (width <= 0 || height <= 0) return;

    const svg = d3.select(element)
      .append('svg')
      .attr('viewBox', `0 0 ${element.clientWidth} ${element.clientHeight}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const tooltip = d3.select('body').append('div')
        .attr('class', 'd3-tooltip')
        .style('position', 'absolute')
        .style('z-index', '10')
        .style('visibility', 'hidden')
        .style('padding', '8px 12px')
        .style('background', 'rgba(0, 0, 0, 0.75)')
        .style('color', '#fff')
        .style('border-radius', '4px')
        .style('font-size', '12px')
        .style('pointer-events', 'none');

    const allWeeks = [ ...percentileData.map(d => d.week), ...patientData.map(d => d.gestationalAge) ];
    const allWeights = [ ...percentileData.map(d => d.p10), ...percentileData.map(d => d.p90), ...patientData.map(d => d.estimatedFetalWeight) ];

    const x = d3.scaleLinear()
      .domain(d3.extent(allWeeks) as [number, number])
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, (d3.max(allWeights) || 0) * 1.05])
      .range([height, 0]);

    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).tickSizeOuter(0).ticks(width/80))
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick line").attr('stroke-opacity', 0.1));

    svg.append('g')
      .call(d3.axisLeft(y).ticks(height/40))
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick line").clone().attr("x2", width).attr("stroke-opacity", 0.1));
      
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .text("Idade Gestacional (Semanas)")
        .style("font-size", "12px").attr("fill", "#374151");

    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 20)
        .attr("x", -height / 2)
        .text("Peso Fetal Estimado (g)")
        .style("font-size", "12px").attr("fill", "#374151");

    const area = d3.area<FetalGrowthPercentile>()
      .x(d => x(d.week))
      .y0(d => y(d.p10))
      .y1(d => y(d.p90))
      .curve(d3.curveMonotoneX);

    svg.append('path').datum(percentileData).attr('fill', '#f0f9ff').attr('stroke', 'none').attr('d', area);

    const line = d3.line<FetalGrowthPercentile>().x(d => x(d.week)).curve(d3.curveMonotoneX);

    svg.append('path').datum(percentileData).attr('fill', 'none').attr('stroke', '#bae6fd').attr('stroke-width', 1.5).attr('d', line.y(d => y(d.p10)));
    svg.append('path').datum(percentileData).attr('fill', 'none').attr('stroke', '#7dd3fc').attr('stroke-width', 2).attr('stroke-dasharray', '5,5').attr('d', line.y(d => y(d.p50)));
    svg.append('path').datum(percentileData).attr('fill', 'none').attr('stroke', '#bae6fd').attr('stroke-width', 1.5).attr('d', line.y(d => y(d.p90)));

    const lastPercentile = percentileData[percentileData.length - 1];
    if (lastPercentile) {
        svg.append("text").attr("transform", `translate(${x(lastPercentile.week)},${y(lastPercentile.p90)})`).attr("x", 5).attr("dy", "0.35em").style("font-size", "10px").style("fill", "#0369a1").text("p90");
        svg.append("text").attr("transform", `translate(${x(lastPercentile.week)},${y(lastPercentile.p50)})`).attr("x", 5).attr("dy", "0.35em").style("font-size", "10px").style("fill", "#0c4a6e").text("p50");
        svg.append("text").attr("transform", `translate(${x(lastPercentile.week)},${y(lastPercentile.p10)})`).attr("x", 5).attr("dy", "0.35em").style("font-size", "10px").style("fill", "#0369a1").text("p10");
    }

    if(patientData.length > 0) {
      const patientLine = d3.line<EcoData>()
        .x(d => x(d.gestationalAge))
        .y(d => y(d.estimatedFetalWeight))
        .curve(d3.curveMonotoneX);

      svg.append('path').datum(patientData).attr('fill', 'none').attr('stroke', '#0d9488').attr('stroke-width', 2.5).attr('d', patientLine);

      svg.selectAll('patient-dots').data(patientData).enter().append('circle')
        .attr('cx', d => x(d.gestationalAge))
        .attr('cy', d => y(d.estimatedFetalWeight))
        .attr('r', 5)
        .attr('fill', '#0d9488')
        .attr('stroke', 'white')
        .attr('stroke-width', 2)
        .style('cursor', 'pointer')
        .on('mouseover', function(event, d) {
            tooltip.style('visibility', 'visible').html(`<strong>IG:</strong> ${d.gestationalAge}s<br><strong>Peso:</strong> ${d.estimatedFetalWeight}g`);
            d3.select(this).transition().duration(150).attr('r', 7);
        })
        .on('mousemove', function(event) {
            tooltip.style('top', (event.pageY - 10) + 'px').style('left', (event.pageX + 10) + 'px');
        })
        .on('mouseout', function() {
            tooltip.style('visibility', 'hidden');
            d3.select(this).transition().duration(150).attr('r', 5);
        });
    }
  }
}