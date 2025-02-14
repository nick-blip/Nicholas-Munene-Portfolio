if (!is.element("languageserver", installed.packages()[, 1])) {
  install.packages("languageserver", dependencies = TRUE)
}
require("languageserver")
if (!is.element("ggplot2", installed.packages()[, 1])) {
  install.packages("ggplot2", dependencies = TRUE)
}
if (!is.element("GGally", installed.packages()[, 1])) {
  install.packages("GGally", dependencies = TRUE)
}
if (!is.element("dplyr", installed.packages()[, 1])) {
  install.packages("dplyr", dependencies = TRUE)
}
if (!is.element("reshape2", installed.packages()[, 1])) { 
  install.packages("reshape2", dependencies = TRUE)
}

# Milestone 1 ----

### Issue 1: DESCRIPTIVE STATISTICS ----
# Code
library(readr)
# Load the mice package
library(mice)

# Read the CSV file with read.csv
library(readr)
breast_cancer <- read_csv("data/breast cancer.csv", 
                          col_types = cols(...33 = col_skip()))
View(breast_cancer)

# Dimensions
dim(breast_cancer)

# Data Types
sapply(breast_cancer, class)

# Measure of Frequency
breast_cancer_frequencies <- table(breast_cancer$symmetry_se)

# Measure of Central Tendency
breast_cancer_freq <- breast_cancer$symmetry_se
cbind(frequency = table(breast_cancer_freq),
      percentage = prop.table(table(breast_cancer_freq)) * 100)

breast_cancer_mode <- names(table(breast_cancer$smoothness_se))[
  which(table(breast_cancer$smoothness_se) ==
          max(table(breast_cancer$smoothness_se)))
]
print(breast_cancer_mode)

# Measure of Distribution
summary(breast_cancer)

# Measure of Standard deviation
sapply(breast_cancer[, c(3:32)], sd)

# Measure the variance of each variable
sapply(breast_cancer[, c(3:32)], var)

# Measure of kurtosis of each variable
if (!is.element("e1071", installed.packages()[, 1])) {
  install.packages("e1071", dependencies = TRUE)
}
require("e1071")

sapply(breast_cancer[, 3:32], kurtosis, type = 2)

# Measure of skewness of each variable
sapply(breast_cancer[, 3:32], skewness, type = 2)



### Issue 2: STATISTICAL TEST (ANOVA)----
breast_cancer_one_way_anova <- aov(compactness_mean ~ diagnosis, data = breast_cancer)
summary(breast_cancer_one_way_anova)

### Issue 3: UNIVARIATE AND MULTIVARIATE PLOTS----
# Load required libraries
library(ggplot2)
library(GGally)
library(dplyr)
library(reshape2)
str(breast_cancer)

# Select only the numeric columns and the target variable
numeric_columns <- breast_cancer[, 3:32]
target_variable <- breast_cancer[, 2]

# Combine the numeric columns and the target variable into one data frame
data <- cbind(numeric_columns, Diagnosis = target_variable)

# Convert the target variable to a factor
data$Diagnosis <- as.factor(data$diagnosis)

# Univariate Plots: Density Plots
# Melt the data for ggplot
melted_data <- melt(data, id.vars = "diagnosis")
# Create density plots for each variable
ggplot(melted_data, aes(x = value, fill = diagnosis)) + 
  geom_density(alpha = 0.5) + 
  facet_wrap(~variable, scales = "free") + 
  theme_minimal() +
  labs(title = "Density Plots of Each Variable", x = "Value", y = "Density")

# Multivariate Plots: Pair Plot with GGally
ggpairs(data, columns = 1:30, aes(color = diagnosis), 
        upper = list(continuous = "points"),
        lower = list(continuous = "smooth"),
        diag = list(continuous = "densityDiag")) + 
  theme_bw() +
  theme(axis.text.x = element_text(angle = 90, hjust = 1))

# Correlation Heatmap with ggplot2
# Compute the correlation matrix
cor_matrix <- cor(numeric_columns)

# Melt the correlation matrix for ggplot2
melted_cor_matrix <- melt(cor_matrix)

# Create a heatmap
ggplot(data = melted_cor_matrix, aes(x = Var1, y = Var2, fill = value)) +
  geom_tile() +
  scale_fill_gradient2(low = "blue", high = "red", mid = "white", 
                       midpoint = 0, limit = c(-1, 1), space = "Lab", 
                       name = "Correlation") +
  theme_minimal() + 
  theme(axis.text.x = element_text(angle = 45, vjust = 1, 
                                   size = 12, hjust = 1)) +
  coord_fixed() +
  labs(title = "Correlation Heatmap")

# Milestone 2 ----

### Issue 5: MISSING VALUES, DATA IMPUTATION, AND DATA TRANSFORMATION ----
# Load required libraries
## dplyr ----
if (require("dplyr")) {
  require("dplyr")
} else {
  install.packages("dplyr", dependencies = TRUE,
                   repos = "https://cloud.r-project.org")
}

# Is there missing data?
any(is.na(breast_cancer))

# Milestone 3 ----
### Issue 6: TRAINING THE MODEL MILESTONE ----
# split the dataset
train_index <- createDataPartition(breast_cancer$diagnosis,
                                   p = 0.75,
                                   list = FALSE)
breast_cancer_train <- breast_cancer[train_index, ]
breast_cancer_test <- breast_cancer[-train_index, ]
# Remove rows with any missing values
breast_cancer_train <- na.omit(breast_cancer_train)
# Check the data type
str(breast_cancer_train$diagnosis)

# Convert to factor if needed
breast_cancer_train$diagnosis <- as.factor(breast_cancer_train$diagnosis)



### Classification: LDA with k-fold Cross Validation ----
train_control <- trainControl(method = "cv", number = 5)

breast_cancer_model_lda <-
  caret::train(`diagnosis` ~ ., data = breast_cancer_train,
               trControl = train_control, na.action = na.omit, method = "lda2",
               metric = "Accuracy")

### Cross-validation ----
# check if the outcome variable is a factor
str(breast_cancer$diagnosis)



# Set the seed for reproducibility
set.seed(123)

# Define the training control
library(caret)
# Define the training control
train_control <- trainControl(method = "cv",
                              number = 10,
                              search = "grid",
                              classProbs = TRUE,
                              summaryFunction = multiClassSummary)

# Model training Random Forest
### Train a Random Forest model----
library(randomForest)
# Convert the class levels to valid variable names
levels(breast_cancer_train$diagnosis) <- make.names(levels(breast_cancer_train$diagnosis))

# Train the Random Forest model
rf_model <- train(diagnosis ~ ., data = breast_cancer_train, method = "rf", trControl = train_control)

rf_model <- train(diagnosis ~ ., data = breast_cancer_train, method = "rf", trControl = train_control)

# Make predictions on the testing set
predictions <- predict(rf_model, newdata = breast_cancer_test)

### Train an SVM model----
library(e1071)
svm_model <- train(diagnosis ~ ., data = breast_cancer_train, method = "svmRadial", trControl = train_control)

# Model sampling and comparison
# Define the control parameters for resampling
train_control <- trainControl(method = "cv", number = 10)  # 10-fold cross-validation

# List of trained models
models_list <- list(
  Random_Forest = rf_model,
  SVM = svm_model
)

# Compare model performance using resampling techniques
results <- resamples(models_list, control = train_control)

# Summarize and compare model performance metrics (e.g., accuracy, sensitivity, specificity)
summary(results)

# Milestone 4 ----
### Issue 7: HYPER-PARAMETER TUNING AND ENSEMBLES

# Load necessary libraries
library(caret)
library(randomForest)

# Define the grid of hyperparameters for mtry
grid <- expand.grid(mtry = c(2, 4, 6, 8, 10)) # Vary the number of variables randomly sampled as candidates at each split

# Set up the control parameters for grid search
control <- trainControl(method = "cv", number = 5)

# Perform grid search for hyperparameters (only mtry)
model_grid_search <- train(symmetry_se ~ ., data = breast_cancer_train, method = "rf",
                           trControl = control, tuneGrid = grid)

# Milestone 5 ----
### Issue 8: CONSOLIDATION ---
saveRDS(breast_cancer_model_lda, "./models/saved_breast_cancer_model_lda.rds")
