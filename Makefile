# css task variables
LESSC = node_modules/.bin/lessc
LESS_FLAGS = -x
LESS_DIR = less
CSS_DIR = css
LESS_FILES = $(wildcard $(LESS_DIR)/*.less)
CSS_FILES = $(patsubst $(LESS_DIR)/%.less, $(CSS_DIR)/%.css, $(LESS_FILES))

# build tasks

build: install less

clean:
	@rm -rf node_modules
	@rm -rf bower_components
	@rm -f $(CSS_FILES)

install:
	@npm install
	@bower install

less: $(CSS_FILES)

$(CSS_DIR)/%.css: $(LESS_DIR)/%.less $(LESS_FILES)
	$(LESSC) $(LESS_FLAGS) $< > $@
