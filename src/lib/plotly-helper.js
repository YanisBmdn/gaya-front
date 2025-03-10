export async function createPlot(element, plotData) {
    try {
      const Plotly = await import('plotly.js-dist');
      await Plotly.newPlot(element, plotData.data, plotData.layout);
    } catch (error) {
      console.error('Error creating plot:', error);
      throw error;
    }
  }

export async function plotToBase64(element){
  try {
    const Plotly = await import('plotly.js-dist');
  
    const dataUrl = await Plotly.toImage(element, { 
      format: 'png', 
      width: 800, 
      height: 600 
    });
    
    const base64String = dataUrl.split(',')[1];
    
    return base64String;
  } catch (error) {
    console.error("Error generating base64 image:", error);
    throw error;
  }
}
