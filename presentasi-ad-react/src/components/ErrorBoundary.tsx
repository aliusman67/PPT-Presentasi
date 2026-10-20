import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = { children: ReactNode; label?: string };
type State = { error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error(`[ErrorBoundary:${this.props.label ?? 'app'}]`, error, info.componentStack);
  }

  private readonly reset = (): void => {
    this.setState({ error: null });
  };

  override render(): ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="slide active" role="alert">
        <div className="slide-inner">
          <header className="slide-head">
            <span className="kicker">Terjadi kesalahan</span>
            <h2>Bagian ini gagal ditampilkan.</h2>
          </header>
          <p className="lead">
            Presentasi tetap bisa dijalankan — coba tampilkan ulang bagian ini, atau lanjutkan
            navigasi dengan tombol di bawah / keyboard.
          </p>
          <p className="mini">
            <code>{error.message}</code>
          </p>
          <div className="end-ctrl">
            <button type="button" className="btn primary" onClick={this.reset}>
              ↺ Tampilkan ulang
            </button>
          </div>
        </div>
      </div>
    );
  }
}
