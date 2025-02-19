export async function createPlot(element, plotData) {
    try {
      const Plotly = await import('plotly.js-dist');
      await Plotly.newPlot(element, plotData.data, plotData.layout);
    } catch (error) {
      console.error('Error creating plot:', error);
      throw error;
    }
  }