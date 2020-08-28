module.exports = {
	Query: {
		departments: require(`./query/departments`),

		courses: require(`./query/courses`),

		teachers: require(`./query/teachers`),
		teacher: require(`./query/teacher`),

		students: require(`./query/students`),
		student: require(`./query/student`),

		classes: require(`./query/classes`),

		attendence: require(`./query/attendence`),

		timeTable: require(`./query/timeTable`),

		friends: require(`./query/friends`),

		notes: require(`./query/notes`),

		notices: require(`./query/notices`),
		notice: require(`./query/notice`),
	},
	Mutation: {
		addDepartment: require(`./mutation/addDepartment`),
		updateDepartment: require(`./mutation/updateDepartment`),

		addCourse: require(`./mutation/addCourse`),
		updateCourse: require(`./mutation/updateCourse`),

		addTeacher: require(`./mutation/addTeacher`),
		updateTeacher: require(`./mutation/updateTeacher`),

		addStudent: require(`./mutation/addStudent`),
		updateStudent: require(`./mutation/updateStudent`),

		newSession: require(`./mutation/newSession`),
		updateClass: require(`./mutation/updateClass`),

		updateSubject: require(`./mutation/updateSubject`),
		addSubject: require(`./mutation/addSubject`),

		addTimeTable: require(`./mutation/addTimeTable`),
		updateTimeTable: require(`./mutation/updateTimeTable`),

		addAttendence: require(`./mutation/addAttendence`),
		attendenceMonth: require(`./mutation/attendenceMonth`),

		addFriends: require(`./mutation/addFriends`),

		addNote: require(`./mutation/addNote`),
		updateNote: require(`./mutation/updateNote`),
		deleteNote: require(`./mutation/deleteNote`),

		addNotice: require(`./mutation/addNotice`),
		updateNotice: require(`./mutation/updateNotice`),
		deleteNotice: require(`./mutation/deleteNotice`),

		changePassword: require(`./mutation/changePassword`),
		login: require(`./mutation/login`),
	},
};
