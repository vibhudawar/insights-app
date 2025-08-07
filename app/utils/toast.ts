interface ToastOptions {
  duration?: number;
  position?: 'top' | 'bottom' | 'center' | 'middle';
  alignment?: 'start' | 'center' | 'end';
}

class DaisyToast {
  private toastContainer: HTMLElement | null = null;
  
  private createToastContainer(): HTMLElement {
    if (!this.toastContainer) {
      this.toastContainer = document.createElement('div');
      this.toastContainer.className = 'toast toast-top toast-end';
      this.toastContainer.style.zIndex = '9999';
      this.toastContainer.style.position = 'fixed';
      document.body.appendChild(this.toastContainer);
    }
    return this.toastContainer;
  }

  private showToast(message: string, type: 'success' | 'error' | 'info' | 'warning', options: ToastOptions = {}) {
    const container = this.createToastContainer();
    const duration = options.duration || 3000;
    
    // Update container position if specified
    if (options.position || options.alignment) {
      container.className = `toast ${options.position ? `toast-${options.position}` : 'toast-top'} ${options.alignment ? `toast-${options.alignment}` : 'toast-end'}`;
    }
    
    // Create alert element
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `<span>${message}</span>`;
    
    // Add to container
    container.appendChild(alert);
    
    // Auto remove after duration
    setTimeout(() => {
      if (container.contains(alert)) {
        container.removeChild(alert);
        
        // Remove container if empty
        if (container.children.length === 0) {
          document.body.removeChild(container);
          this.toastContainer = null;
        }
      }
    }, duration);
    
    return alert;
  }

  success(message: string, options?: ToastOptions) {
    return this.showToast(message, 'success', options);
  }

  error(message: string, options?: ToastOptions) {
    return this.showToast(message, 'error', options);
  }

  info(message: string, options?: ToastOptions) {
    return this.showToast(message, 'info', options);
  }

  warning(message: string, options?: ToastOptions) {
    return this.showToast(message, 'warning', options);
  }
}

// Create a singleton instance
export const toast = new DaisyToast();