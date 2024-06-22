const ctxGender = document.getElementById('gender-chart').getContext('2d');
const ctxAvailability = document.getElementById('availability-chart').getContext('2d');
const ctxDepartment = document.getElementById('department-chart').getContext('2d');

// Gender Ratio Chart
new Chart(ctxGender, {
  type: 'pie',
  data: {
    labels: ['Female', 'Male'],
    datasets: [{
      label: 'Gender Ratio',
      data: [femaleRatio, maleRatio], // Use the variables defined in reports.ejs
      backgroundColor: [
        'rgba(255, 99, 132, 0.2)',
        'rgba(54, 162, 235, 0.2)',
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
      ],
      borderWidth: 1
    }]
  },
  options: {
    title: {
      display: true,
      text: 'Gender Ratio'
    }
  }
});

// Availability Chart
new Chart(ctxAvailability, {
  type: 'bar',
  data: {
    labels: ['Available', 'On Leave'],
    datasets: [{
      label: 'Availability',
      data: [availableCount, onLeaveCount], // Use the variables defined in reports.ejs
      backgroundColor: [
        'rgba(75, 192, 192, 0.2)',
        'rgba(255, 99, 132, 0.2)',
      ],
      borderColor: [
        'rgba(75, 192, 192, 1)',
        'rgba(255, 99, 132, 1)',
      ],
      borderWidth: 1
    }]
  },
  options: {
    title: {
      display: true,
      text: 'Availability'
    }
  }
});

// Department Distribution Chart (example, you can customize this)
new Chart(ctxDepartment, {
  type: 'bar',
  data: {
    labels: ['Development', 'Marketing', 'Sales', 'HR'],
    datasets: [{
      label: 'Department Distribution',
      data: [20, 30, 40, 10],
      backgroundColor: [
        'rgba(255, 99, 132, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(255, 206, 86, 0.2)',
        'rgba(75, 192, 192, 0.2)'
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)'
      ],
      borderWidth: 1
    }]
  },
  options: {
    title: {
      display: true,
      text: 'Department Distribution'
    }
  }
});