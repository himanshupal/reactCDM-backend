const { UserInputError, ForbiddenError } = require(`apollo-server`),
	{ MongoClient } = require(`mongodb`),
	authenticate = require(`../../checkAuth`),
	accessAllowed = [`Director`, `Head of Department`];

module.exports = async (_, { data }, { authorization }) => {
	const client = new MongoClient(process.env.mongo_local, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});
	try {
		await client.connect();
		const user = await authenticate(authorization);
		if (user.access === `student`) throw new Forbidden(`Access Denied !`);
		const check = await client.db(`RBMI`).collection(`classes`).findOne({
			classTeacher: user.username,
		});
		if (!check) {
			if (accessAllowed.includes(user.access))
				throw new UserInputError(
					`No class Assigned !`,
					`You are not currently assigned as 'Class Teacher' for any Class`
				);
			else if (!data.class || !data.data)
				throw new UserInputError(
					`Insufficient data !`,
					`You must provide a class with data to update record of a class`
				);
		}
		const res = await client
			.db(`RBMI`)
			.collection(`attendence`)
			.insertMany([
				...data.data.map((el) => {
					if (el.holiday && el.students)
						throw new UserInputError(
							`It's holiday on ${el.day.date}`,
							`Cannot add students on holiday`
						);
					return {
						day: {
							date: el.day.date,
							month: el.day.month || new Date().getMonth(),
							year: el.day.year || new Date().getFullYear(),
						},
						class: data.class || check._id.toString(),
						holiday: el.holiday,
						students: el.students,
						totalStudents: el.students ? el.students.length : 0,
						createdAt: Date.now(),
						createdBy: user.username,
					};
				}),
			]);
		return res.insertedCount > 0
			? `Attendence of ${res.insertedCount} days successfully saved`
			: `There was some error saving data, please try again or contact admin !`;
	} catch {
		return error;
	} finally {
		await client.close();
	}
};
