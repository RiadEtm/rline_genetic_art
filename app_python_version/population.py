from PIL import Image
import random
import numpy as np
from individual import Individual
import copy

# Training
nb_epochs = 10000

# Population
population_size = 50
cutoff = 15

# Individual
nb_lines = 500
mutation_rate = 0.018

class Population:
	def __init__(self, ref_img, population_size, cutoff, nb_lines, mutation_rate):
		self.ref_img = ref_img
		self.population_size = population_size
		self.cutoff = cutoff
		self.nb_lines = nb_lines
		self.mutation_rate = mutation_rate

		individuals = []
		for i in range(population_size):
			indiv = Individual(ref_img, nb_lines, mutation_rate)
			individuals.append(indiv)
		self.individuals = individuals

	def process(self):
		self.crossOverIndividuals()
		self.mutateIndividuals()
		self.updateCostIndividuals()
		self.sortIndividuals()

	def sortIndividuals(self):
		self.individuals.sort(key=lambda individual: individual.cost)

	def crossOverIndividuals(self):
		individuals = self.individuals[:self.cutoff]
		for k in range(len(individuals), self.population_size):
			index_indiv1 = random.randint(0, self.cutoff-1)
			index_indiv2 = random.randint(0, self.cutoff-1)
			indiv1 = self.individuals[index_indiv1]
			indiv2 = self.individuals[index_indiv2]
			indiv = Individual(self.ref_img, self.nb_lines, self.mutation_rate, indiv1, indiv2)
			individuals.append(indiv)
		self.individuals = individuals

	def mutateIndividuals(self):
		for individual in self.individuals:
			individual.mutate()

	def updateCostIndividuals(self):
		for individual in self.individuals:
			individual.updateCost()

	def getIndividuals(self):
		return self.individuals

	def getIndividual(self, index):
		return self.individuals[index]

if __name__ == '__main__':
	ref_img = Image.open("./images/image512.jpg")

	population = Population(ref_img, population_size, cutoff, nb_lines, mutation_rate)
	
	for i in range(nb_epochs):
		population.process()
		if i%10 == 0:
			population.getIndividual(0).saveImage("results/" + str(i) + ".jpg")
		print(population.getIndividual(0).getCost())



