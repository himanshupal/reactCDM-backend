const { UserInputError, ForbiddenError } = require(`apollo-server`);
const { MongoClient, Timestamp, ObjectId } = require(`mongodb`);

const authenticate = require(`../checkAuth`);

module.exports = async (_, { data: { scope, subject, description } }, { authorization }) => {
	const client = new MongoClient(process.env.mongo_link, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});

	try {
		await client.connect();

		const { _id: loggedInUser, access, class: userClass } = await authenticate(authorization);
		if (access !== `Student`) throw new ForbiddenError(`Access Denied ⚠`);

		const node = client.db(`RBMI`).collection(`notes`);

		if (!subject && !description)
			throw new UserInputError(`Argument Missing ⚠`, {
				error: `You must provide a subject with description to add note.`,
			});

		if (![`Class`, `Private`, `Friends`].includes(scope || `Private`))
			throw new UserInputError(`Invalid Argument ⚠`, {
				error: `Notes can only be private or between friends or for a class.`,
			});

		const writer = await client
			.db(`RBMI`)
			.collection(`students`)
			.findOne({ _id: ObjectId(loggedInUser) });
		if (scope === `Friends` && !writer.friends)
			throw new UserInputError(`Friends not found ⚠`, {
				error: `You need to add some friends first to share notes with them.`,
			});

		const data =
			scope === `Class`
				? { subject, description, scope, class: userClass }
				: { subject, description, scope: scope || `Private` };

		const { insertedId } = await node.insertOne({
			...data,
			createdAt: Timestamp.fromNumber(Date.now()),
			createdBy: loggedInUser,
		});

		const [saved] = await node
			.aggregate([
				{ $match: { _id: insertedId } },
				{ $addFields: { createdBy: { $toObjectId: `$createdBy` } } },
				{
					$lookup: {
						from: `students`,
						localField: `createdBy`,
						foreignField: `_id`,
						as: `createdBy`,
					},
				},
				{ $unwind: `$createdBy` },
			])
			.toArray();

		return saved;
	} catch (error) {
		return error;
	} finally {
		await client.close();
	}
};
