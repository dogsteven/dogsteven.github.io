import Chart from 'chart.js/auto';
import type { ChartConfiguration, ChartOptions } from 'chart.js';
import { color, merge } from 'chart.js/helpers';

/** Native Chart.js config in, native Chart.js instance out. */
export function renderChart(canvas: HTMLCanvasElement, source: ChartConfiguration) {
  // Chart.js mutates its configuration. Keep the author's options for theme changes.
  const config = structuredClone(source);
  config.options = { ...config.options, animation: false, responsive: true, maintainAspectRatio: false };
  let chart: Chart;
  try {
    chart = new Chart(canvas, config);
  } catch (error) {
    // Chart.js can register an instance before rejecting an invalid config.
    Chart.getChart(canvas)?.destroy();
    throw error;
  }

  function updateTheme() {
    const style = getComputedStyle(canvas);
    const css = (name: string) => style.getPropertyValue(name).trim();
    const ink = css('--ink');
    const muted = css('--muted');
    const grid = css('--line');
    const surface = css('--bg-elevated');
    const font = { family: css('--mono') };
    const palette = ['--accent', '--green', '--yellow', '--red'].map(css);

    const scales = Object.fromEntries(Object.keys(chart.scales).map((id) => [id, {
      grid: { color: grid },
      border: { color: css('--line-strong') },
      ticks: { color: muted, font, backdropColor: surface },
      title: { color: ink, font },
      angleLines: { color: grid },
      pointLabels: { color: ink, font },
    }]));

    chart.options = merge<ChartOptions>({}, [{
      color: ink,
      font,
      scales,
      plugins: {
        colors: { enabled: false },
        title: { color: ink, font },
        subtitle: { color: muted, font },
        legend: { labels: { color: ink, font } },
        tooltip: {
          backgroundColor: surface,
          titleColor: ink,
          bodyColor: ink,
          footerColor: ink,
          titleFont: font,
          bodyFont: font,
          footerFont: font,
          borderColor: grid,
          borderWidth: 1,
        },
      },
    }, source.options ?? {}]);
    chart.options.animation = false;
    chart.options.responsive = true;
    chart.options.maintainAspectRatio = false;

    chart.data.datasets.forEach((dataset, index) => {
      const original = source.data.datasets[index];
      const type = original.type ?? source.type;
      const perPoint = ['pie', 'doughnut', 'polarArea'].includes(type);
      const stroke = perPoint
        ? dataset.data.map((_, i) => palette[i % palette.length])
        : palette[index % palette.length];
      const fill = type === 'line' || type === 'radar'
        ? color(palette[index % palette.length]).alpha(0.2).rgbString()
        : stroke;
      dataset.borderColor = original.borderColor ?? stroke;
      dataset.backgroundColor = original.backgroundColor ?? fill;
    });
    chart.update('none');
  }

  try {
    updateTheme();
  } catch (error) {
    chart.destroy();
    throw error;
  }
  return { updateTheme, destroy: () => chart.destroy() };
}
