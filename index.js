const { ApolloServer } = require(`apollo-server`);

(async () => {
	try {
		const { url } = await new ApolloServer({
			playground: true, // To be removed later
			introspection: true, // To be removed later
			resolvers: require(`./resolvers`),
			typeDefs: require(`./typeDefs`),
			context: ({ req }) => req.headers,
			tracing: true,
			cors: true,
		}).listen(process.env.PORT || 80);
		console.log(`Server ready at ${url}`);
	} catch (error) {
		console.error(error);
	}
})();
