import { Component, type ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface Props { children: ReactNode }
interface State { hasError: boolean }

export class WebGLErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() { return { hasError: true }; }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="bg-card/80 border-border">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground">
              3D view is not available. The tutorial content is still accessible in the Element Tutor panel above.
            </p>
          </CardContent>
        </Card>
      );
    }
    return this.props.children;
  }
}
