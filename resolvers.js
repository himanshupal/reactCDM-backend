module.exports = {
	Query: {
		departments: require(`./query/departments`),
		courses: require(`./query/courses`),
		teachers: require(`./query/teachers`),
		students: require(`./query/students`),
		teacher: require(`./query/teacher`),
		student: require(`./query/student`),
		classes: require(`./query/classes`),

		attendenceMonth: require(`./query/getFullMonthAttendence`),
		attendence: require(`./query/getAttendence`),
		timeTable: require(`./query/timeTable`),
		subjects: require(`./query/subjects`),
		classes: require(`./query/classes`),
		notes: require(`./query/notes`),
	},
	Mutation: {
		addDepartment: require(`./mutation/addDepartment`),
		updateDepartment: require(`./mutation/updateDepartment`),

		addTeacher: require(`./mutation/addTeacher`),
		addStudent: require(`./mutation/addStudent`),

		updateTeacher: require(`./mutation/updateTeacher`),
		updateStudent: require(`./mutation/updateStudent`),

		addCourse: require(`./mutation/addCourse`),
		updateCourse: require(`./mutation/updateCourse`),

		addTimeTable: require(`./mutation/addTimeTable`),

		addAttendenceMany: require(`./mutation/addAttendenceMany`),
		updateAttendence: require(`./mutation/updateAttendence`),
		changePassword: require(`./mutation/changePassword`),
		addAttendence: require(`./mutation/addAttendence`),
		updateSubject: require(`./mutation/updateSubject`),
		updateClass: require(`./mutation/updateClass`),
		newSession: require(`./mutation/newSession`),
		addSubject: require(`./mutation/addSubject`),
		createNote: require(`./mutation/addNote`),
		login: require(`./mutation/login`),
	},
};
