// Function to calculate summary statistics
function calculateSummaryStatistics(assessments) {
    if (assessments.length === 0) return;
    
    // Calculate average word recognition and comprehension
    const totalWR = assessments.reduce((sum, assessment) => sum + assessment.wordRecognition, 0);
    const totalComp = assessments.reduce((sum, assessment) => sum + assessment.comprehension, 0);
    
    const avgWR = (totalWR / assessments.length).toFixed(1);
    const avgComp = (totalComp / assessments.length).toFixed(1);
    
    document.getElementById('avg-wr').textContent = `${avgWR}%`;
    document.getElementById('avg-comprehension').textContent = `${avgComp}%`;
    document.getElementById('total-assessments').textContent = assessments.length;
    
    // Calculate improvement rate (simplified for demo)
    // In a real application, this would compare first and last assessments
    const improvementRate = ((avgComp - 60) / 40 * 100).toFixed(1); // Assuming baseline of 60%
    document.getElementById('improvement-rate').textContent = `${improvementRate}%`;
}

// Function to populate reading level table
function populateReadingLevelTable(assessments) {
    const tableBody = document.querySelector('#readingLevelTable tbody');
    tableBody.innerHTML = '';
    
    const levels = ['Independent', 'Instructional', 'Frustration'];
    const levelData = {};
    
    // Initialize level data
    levels.forEach(level => {
        levelData[level] = {
            count: 0,
            totalWR: 0,
            totalComp: 0
        };
    });
    
    // Group assessments by reading level
    assessments.forEach(assessment => {
        if (levelData[assessment.readingLevel]) {
            levelData[assessment.readingLevel].count++;
            levelData[assessment.readingLevel].totalWR += assessment.wordRecognition;
            levelData[assessment.readingLevel].totalComp += assessment.comprehension;
        }
    });
    
    // Add rows to table
    levels.forEach(level => {
        const data = levelData[level];
        if (data.count > 0) {
            const percentage = ((data.count / assessments.length) * 100).toFixed(1);
            const avgWR = (data.totalWR / data.count).toFixed(1);
            const avgComp = (data.totalComp / data.count).toFixed(1);
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${level}</td>
                <td>${data.count}</td>
                <td>${percentage}%</td>
                <td>${avgWR}%</td>
                <td>${avgComp}%</td>
            `;
            tableBody.appendChild(row);
        }
    });
}

// Function to populate assessment type table
function populateAssessmentTypeTable(assessments) {
    const tableBody = document.querySelector('#assessmentTypeTable tbody');
    tableBody.innerHTML = '';
    
    const typeData = {};
    
    // Group assessments by type
    assessments.forEach(assessment => {
        if (!typeData[assessment.type]) {
            typeData[assessment.type] = {
                count: 0,
                totalWR: 0,
                totalComp: 0
            };
        }
        
        typeData[assessment.type].count++;
        typeData[assessment.type].totalWR += assessment.wordRecognition;
        typeData[assessment.type].totalComp += assessment.comprehension;
    });
    
    // Add rows to table
    Object.keys(typeData).forEach(type => {
        const data = typeData[type];
        const avgWR = (data.totalWR / data.count).toFixed(1);
        const avgComp = (data.totalComp / data.count).toFixed(1);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${type}</td>
            <td>${data.count}</td>
            <td>${avgWR}%</td>
            <td>${avgComp}%</td>
        `;
        tableBody.appendChild(row);
    });
}

// Function to populate student progress table
function populateStudentProgressTable(students, assessments) {
    const tableBody = document.querySelector('#studentProgressTable tbody');
    tableBody.innerHTML = '';
    
    // For each student, find their first and last assessment
    students.forEach(student => {
        const studentAssessments = assessments
            .filter(a => a.studentId === student.id)
            .sort((a, b) => new Date(a.date) - new Date(b.date));
        
        if (studentAssessments.length > 0) {
            const firstAssessment = studentAssessments[0];
            const lastAssessment = studentAssessments[studentAssessments.length - 1];
            
            const wrProgress = (lastAssessment.wordRecognition - firstAssessment.wordRecognition).toFixed(1);
            const compProgress = (lastAssessment.comprehension - firstAssessment.comprehension).toFixed(1);
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${student.name}</td>
                <td>${formatDate(firstAssessment.date)}</td>
                <td>${formatDate(lastAssessment.date)}</td>
                <td>${wrProgress}%</td>
                <td>${compProgress}%</td>
                <td>${lastAssessment.readingLevel}</td>
            `;
            tableBody.appendChild(row);
        }
    });
}

// Function to render summary charts
function renderSummaryCharts(assessments, students) {
    // Assessment Type Chart
    const typeCtx = document.getElementById('assessmentTypeChart').getContext('2d');
    const typeData = {};
    
    assessments.forEach(assessment => {
        if (!typeData[assessment.type]) {
            typeData[assessment.type] = {
                count: 0,
                totalWR: 0,
                totalComp: 0
            };
        }
        
        typeData[assessment.type].count++;
        typeData[assessment.type].totalWR += assessment.wordRecognition;
        typeData[assessment.type].totalComp += assessment.comprehension;
    });
    
    const typeLabels = Object.keys(typeData);
    const typeWRData = typeLabels.map(type => (typeData[type].totalWR / typeData[type].count).toFixed(1));
    const typeCompData = typeLabels.map(type => (typeData[type].totalComp / typeData[type].count).toFixed(1));
    
    new Chart(typeCtx, {
        type: 'bar',
        data: {
            labels: typeLabels,
            datasets: [{
                label: 'Word Recognition',
                data: typeWRData,
                backgroundColor: '#4e73df'
            }, {
                label: 'Comprehension',
                data: typeCompData,
                backgroundColor: '#1cc88a'
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
    
    // Gender Chart
    const genderCtx = document.getElementById('genderChart').getContext('2d');
    const genderData = {
        male: { count: 0, totalWR: 0, totalComp: 0 },
        female: { count: 0, totalWR: 0, totalComp: 0 }
    };
    
    assessments.forEach(assessment => {
        const student = students.find(s => s.id === assessment.studentId);
        if (student && student.gender) {
            genderData[student.gender].count++;
            genderData[student.gender].totalWR += assessment.wordRecognition;
            genderData[student.gender].totalComp += assessment.comprehension;
        }
    });
    
    const genderLabels = ['Male', 'Female'];
    const genderWRData = [
        genderData.male.count > 0 ? (genderData.male.totalWR / genderData.male.count).toFixed(1) : 0,
        genderData.female.count > 0 ? (genderData.female.totalWR / genderData.female.count).toFixed(1) : 0
    ];
    const genderCompData = [
        genderData.male.count > 0 ? (genderData.male.totalComp / genderData.male.count).toFixed(1) : 0,
        genderData.female.count > 0 ? (genderData.female.totalComp / genderData.female.count).toFixed(1) : 0
    ];
    
    new Chart(genderCtx, {
        type: 'bar',
        data: {
            labels: genderLabels,
            datasets: [{
                label: 'Word Recognition',
                data: genderWRData,
                backgroundColor: '#4e73df'
            }, {
                label: 'Comprehension',
                data: genderCompData,
                backgroundColor: '#1cc88a'
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
}

// Utility function to format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}