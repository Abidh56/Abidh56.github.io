async function loadExcel() {
    try {
        const response = await fetch('routine.xlsx');
        const arrayBuffer = await response.arrayBuffer();

        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        checkCurrentActivity(jsonData);
    } catch (error) {
        console.error('Error loading Excel file:', error);
    }
}

function formatDay(day1, day2) {
    const days = {
        "Mon": "Monday",
        "Tue": "Tuesday",
        "Wed": "Wednesday",
        "Thu": "Thursday",
        "Fri": "Friday",
        "Sat": "Saturday",
        "Sun": "Sunday"
    };
    return [day1, day2].map(day => days[day] || day).filter(Boolean).join(', ') || "";
}

function formatTime(time1, time2) {
    return time1 === time2 ? time1 || "" : [time1, time2].filter(Boolean).join(' / ') || "";
}

function getCurrentDay() {
    return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][new Date().getDay()];
}

function getCurrentTime() {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
}

function timeToMinutes(time) {
    let [hours, minutes] = time.split(':').map(Number);
    if (time.includes('PM') && hours !== 12) hours += 12;
    if (time.includes('AM') && hours === 12) hours = 0;
    return hours * 60 + minutes;
}

function checkCurrentActivity(scheduleData) {
    const currentDay = getCurrentDay();
    const currentTime = getCurrentTime();
    let currentActivity = "I'm not available right now. Drop me an <a href='mailto:abid@cse.uiu.ac.bd' style='color: inherit; font-weight: bold; text-decoration: underline;'>email</a> if you need anything.";

    for (const row of scheduleData) {
        const day = formatDay(row.Day1, row.Day2);
        const timeframe = formatTime(row.Time1, row.Time2);

        const [start, end] = timeframe.split(' - ').map(time => timeToMinutes(time.trim()));
        const current = timeToMinutes(currentTime);

        if (day.includes(currentDay) && current >= start && current <= end) {
            currentActivity = `Currently, I'm taking ${row.Title} course at ClassRoom(${row.Room1 || row.Room2 || ""}).`;
            break;
        }
    }

    document.getElementById('activityText').innerHTML = currentActivity;
}

loadExcel();

setInterval(() => location.reload(), 60000);