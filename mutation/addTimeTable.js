const { ForbiddenError, UserInputError } = require("apollo-server");
const { MongoClient, Timestamp } = require(`mongodb`);

const authenticate = require(`../checkAuth`);

const permitted = [`Director`, `Head of Department`];

module.exports = async (_, { class: className, data }, { authorization }) => {
	const client = new MongoClient(process.env.mongo_link, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});

	try {
		await client.connect();

		const { _id: loggedInUser, access } = await authenticate(authorization);
		if (!permitted.includes(access))
			throw new ForbiddenError(`Access Denied ⚠`);

		const node = client.db(`RBMI`).collection(`timetable`);

		const checkClass = await node.findOne({ className });
		if (checkClass)
			throw new UserInputError(`Already saved ⚠`, {
				error: `Time Table already exists for selected class. Consider updating it.`,
			});

		data = data.filter((x) => x.from && x.to);

		const res = await client
			.db(`RBMI`)
			.collection(`timetable`)
			.insertOne({
				className,
				subjects: data,
				createdAt: Timestamp.fromNumber(Date.now()),
				createdBy: loggedInUser,
			});
		return res.insertedCount > 0
			? `Time Table successfully created ✔`
			: `There was some error saving data. Please try again or contact admin if issue persists.`;
		return res;
	} catch (error) {
		return error;
	} finally {
		await client.close();
	}
};
