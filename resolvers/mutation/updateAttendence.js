const { UserInputError, ForbiddenError } = require(`apollo-server`),
	{ MongoClient } = require(`mongodb`),
	authenticate = require(`../../checkAuth`);

module.exports = async (_, { id, data }, { authorization }) => {
	const client = new MongoClient(process.env.mongo_local, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});
	try {
		await client.connect();
		user = authenticate(authorization);
		if (user.access === `student`) throw new ForbiddenError(`Access Denied !`);
		if (data.holiday && data.students)
			throw new UserInputError(
				`It's holiday...`,
				`Cannot add students on holiday`
			);
		const check = await client
			.db(`RBMI`)
			.collection(`attendence`)
			.findOne({ _id: ObjectId(id) });
		if (!check)
			throw new UserInputError(
				`Not found !`,
				`Couldn't find attendence data you are trying to update`
			);
		if (data.holiday) data.students = null;
		if (data.students) data.holiday = null;
		const res = await client
			.db(`RBMI`)
			.collection(`attendence`)
			.updateOne(
				{
					_id: ObjectId(id),
				},
				{
					$set: {
						...data,
						totalStudents: data.students ? data.students.length : 0,
						lastUpdated: Date.now(),
						lastUpdatedBy: user.username,
					},
				}
			);
		return res.modifiedCount > 0
			? `Attendence updated !`
			: `Error saving data. Please try again or contact admin if issue persists`;
	} catch {
		return error;
	} finally {
		await client.close();
	}
};
