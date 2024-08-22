import express from "express";
import { readFile } from "node:fs/promises";
import path from "node:path"
import url from "node:url";
import { DateTime } from "luxon"

// получаем абсолютный путь к файлу index.js
const __filename = url.fileURLToPath(import.meta.url)
// получаем папку в которой лежит файл index.js
const __dirname = path.dirname(__filename);

const timeZone = "UTC";

const port = 3000;

const app = express();

const loadBuses = async () => {
  // получаем данные из файла
  const data = await readFile(path.join(__dirname, 'buses.json'), 'utf-8');
  return JSON.parse(data);
}

const getNextDeparture = (firstDepartureTime, frequencyMinutes) => {
  const now = DateTime.now().setZone(timeZone);
  const [hours, minutes] = firstDepartureTime.split(':').map(Number);
  let departure = DateTime.now().set({ hours, minutes, seconds: 0, milliseconds: 0 }).setZone(timeZone);

  if (now > departure) {
    departure = departure.plus({ minutes: frequencyMinutes })
  }

  const endOfDay = DateTime.now().set({ hours: 23, minutes: 59, seconds: 59, milliseconds: 0 }).setZone(timeZone);

  if (departure > endOfDay) {
    departure = departure.startOf('day').plus({ days: 1 }).set({ hours, minutes });
  }

  while (now > departure) {
    departure = departure.plus({ minutes: frequencyMinutes })
  }

  return departure;
}

const sendUpdatedData = async () => {
  const buses = await loadBuses();

  const updatedBuses = buses.map((bus) => {
    const nextDeparture = getNextDeparture(bus.firstDepartureTime, bus.frequencyMinutes);
    return {
      ...bus, nextDeparture: {
        data: "",
        time: "",
      }
    }
  })
}

sendUpdatedData()

app.get('/next-departure', async (req, res) => {
  try {
    const updatedBuses = sendUpdatedData();
    console.log('updatedBuses: ', updatedBuses);
    res.send('Hello world')
  } catch (error) {

    res.send('error' + error)
  }
})

app.listen(port, () => {
  console.log('Server running on http://localhost:' + port);
})