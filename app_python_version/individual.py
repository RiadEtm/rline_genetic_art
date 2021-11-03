from PIL import Image, ImageDraw
import random
import numpy as np
import time
import pprint
import copy
import ujson

class Individual:
	def __init__(self, ref_img, nb_lines, mutation_rate, indiv1=False, indiv2=False):
		self.im_width, self.im_height = ref_img.size
		self.nb_lines = nb_lines
		self.mutation_rate = mutation_rate

		if indiv1 == False and indiv2 == False:
			self.dna = self.generateRandomDNA()
		else:
			indiv1_dna = indiv1.getDNA()
			indiv2_dna = indiv2.getDNA()

			dna = []
			for i in range(len(indiv1_dna)):
				p = random.random()
				if p < 0.5:
					#dna.append(copy.deepcopy(indiv1_dna[i]))
					dna.append(ujson.loads(ujson.dumps(indiv1_dna[i])))
				else:
					#dna.append(copy.deepcopy(indiv2_dna[i]))
					dna.append(ujson.loads(ujson.dumps(indiv2_dna[i])))
			self.dna = dna

		self.target = np.asarray(ref_img)
		self.cost = self.computeFitness()

	def getDNA(self):
		return self.dna

	def getCost(self):
		return self.cost

	def updateCost(self):
		self.cost = self.computeFitness()

	def computeFitness(self):
		current_img = self.dnaToImage()
		diff_pixels = np.abs(self.target - np.asarray(current_img))
		cost = np.sum(diff_pixels)
		return cost

	def mutate(self):
		nb_mutations = 0
		for i in range(len(self.dna)):
			p = random.random()
			if p < self.mutation_rate:
				nb_mutations += 1
				gene_part = random.randint(0, 5)
				if gene_part == 0:
					# generateNewShape
					x1 = random.randint(0, self.im_width)
					y1 = random.randint(0, self.im_height)
					x2 = random.randint(0, self.im_width)
					y2 = random.randint(0, self.im_height)
					shape = [[x1, y1], [self.im_width - x2, self.im_height - y2]]
					self.dna[i]["shape"] = shape
				elif gene_part == 1:
					# mutate red part of color
					color_r = random.randint(0, 255)
					self.dna[i]["color"][0] = color_r
				elif gene_part == 2:
					# mutate green part of color
					color_g = random.randint(0, 255)
					self.dna[i]["color"][1] = color_g
				elif gene_part == 3:
					# mutate blue part of color
					color_b = random.randint(0, 255)
					self.dna[i]["color"][2] = color_b
				elif gene_part == 4:
					# mutate alpha part of color
					alpha = random.randint(0, 255)
					self.dna[i]["color"][3] = alpha						
				elif gene_part == 5:
					# generate new thickness
					thickness = random.randint(1, 3)
					self.dna[i]["thickness"] = thickness

	def generateRandomDNA(self):
		random_dna = []
		for k in range(self.nb_lines):
			x1 = random.randint(0, self.im_width)
			y1 = random.randint(0, self.im_height)
			x2 = random.randint(0, self.im_width)
			y2 = random.randint(0, self.im_height)
			shape = [[x1, y1], [self.im_width - x2, self.im_height - y2]]
			color = [random.randint(0, 255), random.randint(0, 255), random.randint(0, 255), random.randint(0, 255)]
			thickness = random.randint(1, 3)
			gene = {"shape" : shape, "color" : color, "thickness" : thickness}
			random_dna.append(gene)
		return random_dna

	def dnaToImage(self):
		img = Image.new("RGB", (self.im_width, self.im_height), "#fff")
		draw = ImageDraw.Draw(img, 'RGBA') 
		for k in range(len(self.dna)):
			shape = self.dna[k]["shape"]
			color = self.dna[k]["color"]
			thickness = self.dna[k]["thickness"]
			draw.line([(shape[0][0], shape[0][1]), (shape[1][0], shape[1][1])], fill=(color[0], color[1], color[2], color[3]), width=thickness)
		return img

	def saveImage(self, img_name):
		img = self.dnaToImage()
		img.save(img_name)

	def show(self):
		img = self.dnaToImage()
		#img = img.resize((self.im_width // 2, self.im_height // 2), resample=Image.ANTIALIAS)
		img.show()

if __name__ == '__main__':
	# Load target image
	img_ref = Image.open("./images/256.jpg")

	t1 = time.time()

	indiv1 = Individual(img_ref, 10, 0.5)
	t2 = time.time()
	print("Creation : {}".format(t2-t1))

	indiv1.show()
	t3 = time.time()
	print("Show : {}".format(t3-t2))

	indiv1.mutate()
	t4 = time.time()
	print("Mutation : {}".format(t4-t3))

	indiv1.show()
	t5 = time.time()
	print("Show : {}".format(t5-t4))

	indiv1.computeFitness()
	t6 = time.time()
	print("computeFitness : {}".format(t6-t5))