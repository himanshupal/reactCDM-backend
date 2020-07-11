const { ForbiddenError, UserInputError } = require(`apollo-server`),
	{ MongoClient, ObjectId } = require(`mongodb`),
	authenticate = require(`../../checkAuth`),
	accessAllowed = [`Director`, `Head of Department`];

module.exports = async (_, { month, year, class: clas }, { authorization }) => {
	const client = new MongoClient(process.env.mongo_local, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});
	try {
		await client.connect();
		const user = authenticate(authorization);
		if (user.access === `student`) throw new ForbiddenError(`Access Denied !`);
		const check = await client.db(`RBMI`).collection(`classes`).findOne({
			classTeacher: user.username,
		});
		if (!check) {
			if (!accessAllowed(user.access))
				throw new UserInputError(
					`No class Assigned !`,
					`You are not currently assigned as Class Teacher for any Class`
				);
			else if (!clas)
				throw new UserInputError(
					`Insufficient data !`,
					`You must provide a class to get attendence of`
				);
		}
		return await client
			.db(`RBMI`)
			.collection(`attendence`)
			.aggregate([
				{
					$match: {
						"day.month": month || new Date().getMonth(),
						"day.year": year || new Date().getFullYear(),
						class: clas || check._id.toString(),
					},
				},
				{
					$lookup: {
						from: `students`,
						localField: `students`,
						foreignField: `_id`,
						as: `students`,
					},
				},
			])
			.toArray();
	} catch {
		return error;
	} finally {
		await client.close();
	}
};
