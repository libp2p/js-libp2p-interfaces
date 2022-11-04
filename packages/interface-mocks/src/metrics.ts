import type { Metric, MetricGroup, StopTimer, Metrics, CalculatedMetricOptions, MetricOptions, Stats, TrackStreamOptions } from '@libp2p/interface-metrics'
import type { PeerId } from '@libp2p/interface-peer-id'

class DefaultMetric implements Metric {
  public value: number = 0

  update (value: number): void {
    this.value = value
  }

  increment (value = 1): void {
    this.value += value
  }

  decrement (value = 1): void {
    this.value -= value
  }

  reset (): void {
    this.value = 0
  }

  timer (): StopTimer {
    const start = Date.now()

    return () => {
      this.value = Date.now() - start
    }
  }
}

class DefaultGroupMetric implements MetricGroup {
  public values: Record<string, number> = {}

  update (values: Record<string, number>): void {
    Object.entries(values).forEach(([key, value]) => {
      this.values[key] = value
    })
  }

  increment (values: Record<string, number | unknown>): void {
    Object.entries(values).forEach(([key, value]) => {
      this.values[key] = this.values[key] ?? 0
      const inc = typeof value === 'number' ? value : 1

      this.values[key] += inc
    })
  }

  decrement (values: Record<string, number | unknown>): void {
    Object.entries(values).forEach(([key, value]) => {
      this.values[key] = this.values[key] ?? 0
      const dec = typeof value === 'number' ? value : 1

      this.values[key] -= dec
    })
  }

  reset (): void {
    this.values = {}
  }

  timer (key: string): StopTimer {
    const start = Date.now()

    return () => {
      this.values[key] = Date.now() - start
    }
  }
}

class MockMetrics implements Metrics {
  public metrics = new Map<string, any>()

  getGlobal (): Stats {
    throw new Error('not implemented')
  }

  getPeers () {
    return []
  }

  forPeer (peerId: PeerId): Stats | undefined {
    throw new Error('not implemented')
  }

  getProtocols (): string[] {
    return []
  }

  forProtocol (protocol: string): Stats | undefined {
    throw new Error('not implemented')
  }

  updatePlaceholder (placeholder: PeerId, peerId: PeerId): void {

  }

  trackStream (data: TrackStreamOptions): void {

  }

  registerMetric (name: string, opts: CalculatedMetricOptions): void
  registerMetric (name: string, opts?: MetricOptions): Metric
  registerMetric (name: string, opts: any): any {
    if (name == null ?? name.trim() === '') {
      throw new Error('Metric name is required')
    }

    if (opts?.calculate != null) {
      // calculated metric
      this.metrics.set(name, opts.calculate)
      return
    }

    const metric = new DefaultMetric()
    this.metrics.set(name, metric)

    return metric
  }

  registerMetricGroup (name: string, opts: CalculatedMetricOptions<Record<string, number>>): void
  registerMetricGroup (name: string, opts?: MetricOptions): MetricGroup
  registerMetricGroup (name: string, opts: any): any {
    if (name == null ?? name.trim() === '') {
      throw new Error('Metric name is required')
    }

    if (opts?.calculate != null) {
      // calculated metric
      this.metrics.set(name, opts.calculate)
      return
    }

    const metric = new DefaultGroupMetric()
    this.metrics.set(name, metric)

    return metric
  }
}

export function mockMetrics (): () => Metrics {
  return () => new MockMetrics()
}
