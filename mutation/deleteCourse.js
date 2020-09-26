const { UserInputError, ForbiddenError } = require(`apollo-server`);
const { MongoClient, ObjectId } = require(`mongodb`);

const authenticate = require(`../checkAuth`);
const { dbName } = require(`../config`);

const permitted = [`Director`, `Head of Department`];

module.exports = async (_, { _id, classes }, { authorization }) => {
	const client = new MongoClient(process.env.mongo_link, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});

	try {
		await client.connect();

		const { access } = await authenticate(authorization);
		if (!permitted.includes(access)) throw new ForbiddenError(`Access Denied ⚠`);

		const deleteCourse = async () => {
			const { deletedCount } = await client
				.db(dbName)
				.collection(`courses`)
				.deleteOne({ _id: ObjectId(_id) });

			if (!deletedCount)
				throw new UserInputError(`Unknown Error ⚠`, {
					error: `Error deleting course. Please try again or contact admin if issue persists.`,
				});
		};

		const deleteClasses = async () => {
			const node = client.db(dbName).collection(`classes`);

			const classIt = await node.find({ course: _id }, { projection: { _id: true, name: true } }).toArray();

			const {
				deletedCount,
				result: { n },
			} = await node.deleteMany({ course: _id });

			if (!deletedCount & n)
				throw new UserInputError(`Unknown Error ⚠`, {
					error: `Error deleting classes. Please try again or contact admin if issue persists.`,
				});

			if (classIt.length > 0)
				await Promise.all(
					classIt.forEach(async ({ _id, name }) => {
						try {
							await client.db(dbName).collection(`students`).deleteMany({ class: _id.toString() });

							await client.db(dbName).collection(`notes`).deleteMany({ scope: `Class`, class: _id.toString() });

							await client.db(dbName).collection(`notices`).deleteMany({ scope: `Class`, validFor: name });

							await client.db(dbName).collection(`subjects`).deleteMany({ class: name });

							await client.db(dbName).collection(`timetables`).deleteMany({ class: name });
						} catch (error) {
							throw error;
						}
					})
				);
		};

		if (classes) {
			await deleteCourse();
			await deleteClasses();
		} else {
			await deleteCourse();
		}

		return true;
	} catch (error) {
		return error;
	} finally {
		await client.close();
	}
};
