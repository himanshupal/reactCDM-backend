const { UserInputError, ForbiddenError } = require(`apollo-server`);
const { MongoClient, Timestamp } = require(`mongodb`);

const authenticate = require(`../checkAuth`);

module.exports = async (_, { data }, { authorization }) => {
	const client = new MongoClient(process.env.mongo_link, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});

	try {
		await client.connect();

		const { _id: loggedInUser, access } = await authenticate(authorization);
		if (access !== `Director`) throw new ForbiddenError(`Access Denied ⚠`);

		const node = client.db(`RBMI`).collection(`departments`);

		if (!data.name || !data.director)
			throw new UserInputError(`Argument Missing ⚠`, {
				error: `All fields are required.`,
			});

		const check = await node.findOne({
			$or: [{ name: data.name }, { director: data.director }],
		});

		if (check) {
			if (check.name === data.name)
				throw new UserInputError(`Already exists ⚠`, {
					error: `There is already a department with same name.`,
				});
			if (check.director === data.director)
				throw new UserInputError(`Already exists ⚠`, {
					error: `The teacher is already assigned as Director to another department.`,
				});
		}

		const {
			ops: [{ _id }],
		} = await node.insertOne({
			...data,
			createdAt: Timestamp.fromNumber(Date.now()),
			createdBy: loggedInUser,
		});

		const [department] = await node
			.aggregate([
				{ $match: { _id } },
				{
					$addFields: {
						director: { $toObjectId: `$director` },
						createdBy: { $toObjectId: `$createdBy` },
					},
				},
				{
					$lookup: {
						from: `teachers`,
						localField: `director`,
						foreignField: `_id`,
						as: `director`,
					},
				},
				{ $unwind: `$director` },
				{
					$lookup: {
						from: `teachers`,
						localField: `createdBy`,
						foreignField: `_id`,
						as: `createdBy`,
					},
				},
				{ $unwind: `$createdBy` },
			])
			.toArray();

		return department;
	} catch (error) {
		return error;
	} finally {
		await client.close();
	}
};
