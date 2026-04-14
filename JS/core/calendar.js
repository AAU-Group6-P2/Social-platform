// datoer som objekter

function updateDate(){

    const date = new Date();

    const today = {
        year: date.getFullYear(), // Indeværende år 
        month: date.getMonth()+1, // Indeværende måned 0 = januar, 11 = december 
        day: date.getDate() // indeværende dag; 14., 15. 
    }

document.getElementById("currentDate").textContent = today.day + "." + today.month + "." + today.year;
}

setInterval(updateDate, 1000);