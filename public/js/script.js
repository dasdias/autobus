'use strict';

const fetchBusData = async () => {
  try {
    const response = await fetch("/next-departure");

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error(`Error fetching bus data: ${error}`);
  }

};
const renderBusData = (buses) => {
  const tableBody = document.querySelector('#bus tbody');
  tableBody.textContent = "";

  console.log('buses: ', buses);
};


const init = async () => {

  const buses = await fetchBusData();

  renderBusData(buses);
}
init();