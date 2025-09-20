import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export const exportToPDF = async (pdfName: string | undefined) => {
  // Create a new jsPDF instance
  const pdf = new jsPDF("portrait", "pt", "a4"); 

  // Capture the content to be converted to PDF using html2canvas
  const data = await html2canvas(window.document.querySelector("#pdf") as HTMLElement);

  // Convert the captured content to a data URL (image)
  const img = data.toDataURL("image/png");  

  // Get the image properties
  const imgProperties = pdf.getImageProperties(img);

  // Calculate the PDF dimensions based on the image size
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (imgProperties.height * pdfWidth) / imgProperties.width;

  // Add the image to the PDF
  pdf.addImage(img, "PNG", 0, 0, pdfWidth, pdfHeight);

  // Save the PDF with the provided name
  pdf.save(pdfName);
};

// Example usage:
// exportToPDF("loan_arrears_report.pdf");

{/*
//import jsPDF from "jspdf";
///import html2canvas from "html2canvas";

export const exportToPDF = async (pdfName) => {
  // Create a new jsPDF instance
  const pdf = new jsPDF("portrait", "pt", "a4"); 

  // Get the content element to capture
  const contentElement = document.querySelector("#pdf");

  // Calculate the total height of the content
  const contentHeight = contentElement.offsetHeight;

  // Set the initial position for rendering
  let position = 0;

  // Define the function to capture and add a page to the PDF
  const addPage = async () => {
    // Capture the content within the current viewport
    const data = await html2canvas(contentElement, {
      height: contentHeight - position,
      scrollY: position,
    });

    // Convert the captured content to a data URL (image)
    const img = data.toDataURL("image/png");  

    // Add the image to the PDF
    pdf.addImage(img, "PNG", 0, 0, pdf.internal.pageSize.getWidth(), 0);

    // Increment the position for the next page
    position += data.height;

    // Check if there is more content to capture
    if (position < contentHeight) {
      pdf.addPage(); // Add a new page if there's more content
      addPage(); // Recursively capture and add the next page
    }
  };

  // Start capturing and adding pages
  await addPage();

  // Save the multi-page PDF with the provided name
  pdf.save(pdfName);
};
*/}