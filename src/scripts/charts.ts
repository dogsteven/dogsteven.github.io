import type { ChartConfiguration } from 'chart.js';
import type { renderChart } from './chart-renderer';

type MountedChart = ReturnType<typeof renderChart>;
const instances = new Map<HTMLCanvasElement, MountedChart>();
let page: AbortController | undefined;
let visibility: IntersectionObserver | undefined;
let paletteObserver: MutationObserver | undefined;

function cleanup() {
  page?.abort();
  visibility?.disconnect();
  paletteObserver?.disconnect();
  for (const chart of instances.values()) chart.destroy();
  instances.clear();
}

function initCharts() {
  cleanup();
  const canvases = document.querySelectorAll<HTMLCanvasElement>('canvas[data-chart]');
  if (!canvases.length) return;
  page = new AbortController();
  const { signal } = page;

  async function mount(canvas: HTMLCanvasElement) {
    const container = canvas.parentElement!;
    container.setAttribute('aria-busy', 'true');
    try {
      const [renderer, response] = await Promise.all([
        import('./chart-renderer'),
        fetch(canvas.dataset.chart!, { signal }),
      ]);
      if (!response.ok) throw new Error(`Chart request failed: ${response.status}`);
      const config: ChartConfiguration = await response.json();
      if (signal.aborted || !canvas.isConnected) return;
      const chart = renderer.renderChart(canvas, config);
      instances.set(canvas, chart);
      container.dataset.chartState = 'ready';
    } catch (error) {
      if (signal.aborted) return;
      container.dataset.chartState = 'error';
      const message = document.createElement('p');
      message.className = 'chart-error';
      message.setAttribute('role', 'status');
      message.textContent = 'This plot could not be loaded. ';
      const link = document.createElement('a');
      link.href = canvas.dataset.chart!;
      link.textContent = 'View plot data';
      message.append(link);
      container.append(message);
      console.error('Unable to render chart', error);
    } finally {
      container.removeAttribute('aria-busy');
    }
  }

  visibility = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      visibility?.unobserve(entry.target);
      void mount(entry.target as HTMLCanvasElement);
    }
  }, { rootMargin: '200px' });

  for (const canvas of canvases) {
    // Chart.js requires a dedicated parent to measure its responsive canvas.
    // Reuse it if Astro restores a previously visited page.
    let container = canvas.parentElement!;
    if (!container.classList.contains('chart-container')) {
      container = document.createElement('div');
      container.className = 'chart-container';
      canvas.before(container);
      container.append(canvas);
    }
    container.querySelector('.chart-error')?.remove();
    container.dataset.chartState = 'loading';
    canvas.setAttribute('role', 'img');
    visibility.observe(canvas);
  }

  paletteObserver = new MutationObserver(() => {
    for (const chart of instances.values()) chart.updateTheme();
  });
  paletteObserver.observe(document.documentElement, { attributeFilter: ['data-palette'] });
  // Re-measure labels if the site's web font arrives after the first render.
  void document.fonts.ready.then(() => {
    if (!signal.aborted) {
      for (const chart of instances.values()) chart.updateTheme();
    }
  });
}

initCharts();
document.addEventListener('astro:page-load', initCharts);
document.addEventListener('astro:before-swap', cleanup);
