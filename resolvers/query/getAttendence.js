const { ForbiddenError, UserInputError } = require(`apollo-server`),
	{ MongoClient, ObjectId } = require(`mongodb`);

const authenticate = require(`../../checkAuth`),
	accessAllowed = [`Director`, `Head of Department`, `Associate Professor`, `Assistant Professor`];

module.exports = async (_, { id }, { authorization }) => {
	const client = new MongoClient(process.env.mongo_link, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});
	try {
		await client.connect();
		const user = await authenticate(authorization);
		if (!accessAllowed.includes(user.access)) throw new ForbiddenError(`Access Denied ⚠`);
		const check = await client.db(`RBMI`).collection(`classes`).findOne({
			classTeacher: user.username,
		});
		if (!check)
			if (!accessAllowed.includes(user.access))
				throw new Error(`No class Assigned !`, `You are not currently assigned as Class Teacher for any Class`);
		const res = await client
			.db(`RBMI`)
			.collection(`attendence`)
			.aggregate([
				{
					$match: {
						$or: [{ _id: ObjectId(id) }, { class: check.class }],
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
		return res[0];
	} catch {
		return error;
	} finally {
		await client.close();
	}
};
