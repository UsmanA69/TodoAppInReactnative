import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import AsyncStorage from '@react-native-async-storage/async-storage';

const styles = StyleSheet.create({
  header: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: '#e5e7eb',
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  inputContainer: {
    backgroundColor: 'white',
    elevation: 10,
    flex: 1,
    height: 50,
    marginVertical: 20,
    marginRight: 20,
    borderRadius: 30,
    paddingHorizontal: 20,
  },
  iconContainer: {
    height: 50,
    width: 50,
    backgroundColor: 'white',
    borderRadius: 25,
    elevation: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listItem: {
    padding: 20,
    backgroundColor: 'white',
    flexDirection: 'row',
    elevation: 12,
    borderRadius: 7,
    marginVertical: 10,
  },
  actionIcon: {
    height: 25,
    width: 25,
    backgroundColor: 'green',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
    borderRadius: 3,
  },
});

const App = () => {
  const [userName, setUserName] = React.useState(null);
  const [showUserName, setShowUserName] = React.useState(null);
  const [todos, setTodos] = React.useState([]);
  const [textInput, setTextInput] = React.useState('');
  const [todosDeleted, setTodosDeleted] = React.useState(false);
  const [toggleEditBtn, setToggleEditBtn] = React.useState(true);
  const [isEdit, setIsEdit] = React.useState(null);

  React.useEffect(() => {
    getTodosFromUserDevice();
  }, []);

  React.useEffect(() => {
    saveTodoTouserDevice(todos, userName);
  }, [todos, userName]);

  const ListItem = ({todo}) => {
    //console.log(todo);
    return (
      <>
        <View style={{alignItems: 'flex-end', paddingHorizontal: 10}}>
          <Text style={{color:'black'}}>{todo.timeAdded}</Text>
        </View>
        <View style={styles.listItem}>
          <View style={{flex: 1}}>
            <Text
              style={{
                fontWeight: 'bold',
                fontSize: 15,
                color: '#1f145c',
                textDecorationLine: todo?.completed ? 'line-through' : 'none',
              }}>
              {todo?.task}
            </Text>
          </View>
          {!todo?.completed && (
            <TouchableOpacity
              style={[styles.actionIcon]}
              onPress={() => markTodoCompleted(todo?.id)}>
              <FontAwesome5 name={'check'} size={15} color="#e5e7eb" />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.actionIcon, {backgroundColor: 'red'}]}
            onPress={() => deleteTodo(todo?.id)}>
            <FontAwesome5 name={'trash'} size={15} color="#e5e7eb" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionIcon, {backgroundColor: 'lightblue'}]}
            onPress={() => editTodo(todo?.id)}>
            <FontAwesome5 name={'edit'} size={15} color="black" />
          </TouchableOpacity>
        </View>
      </>
    );
  };

  //let todosAndName = [{userName},todos]
  //console.log(todosAndName);
  const getTodosFromUserDevice = async () => {
    try {
      const todos = await AsyncStorage.getItem('todos');
      if (todos != null) {
        setTodos(JSON.parse(todos));
      }
    } catch (error) {
      Alert.alert('Error', error);
    }

    try {
      const userName = await AsyncStorage.getItem('name');
      if (userName != null) {
        setUserName(JSON.parse(userName));
      }
    } catch (error) {
      Alert.alert('Error', error);
    }
  };

  const saveTodoTouserDevice = async (todos, userName) => {
    try {
      const stringifyTodos = JSON.stringify(todos);
      await AsyncStorage.setItem('todos', stringifyTodos);
    } catch (e) {
      Alert.alert('Error', e);
      // saving error
    }
    try {
      const stringifyuserName = JSON.stringify(userName);
      await AsyncStorage.setItem('name', stringifyuserName);
    } catch (e) {
      Alert.alert('Error', e);
      // saving error
    }
  };

  const addTodo = () => {
    let today = new Date();

    let month = today.getMonth() + 1;
    let year = today.getFullYear();
    let date = today.getDate();
    let current_date = `${month}/${date}/${year}`;

    let hours = today.getHours();
    let minutes = today.getMinutes();
    let current_time = `${hours}:${minutes}`;


    if (textInput == '') {
      Alert.alert('Error Empty Input', 'please input todo');
    } else if (textInput && !toggleEditBtn) {
      setTodos(
        todos.map(curElem => {
          if (curElem.id === isEdit) {
            return {...curElem, task: textInput};
          }
          return curElem;
        }),
      );
      setToggleEditBtn(true);
      setTextInput('');
      setIsEdit(null);
    } else {
      const newTodo = {
        id: Math.random(),
        task: textInput,
        completed: false,
        timeAdded: `${current_date}  ${current_time}`,
      };
      console.log(newTodo);
      setTodos([...todos, newTodo]);
      setTextInput('');
      setTodosDeleted(false);
    }
  };

  const editTodo = todoId => {
    let newEditItem = todos.find(elem => {
      return elem.id === todoId;
    });
    setToggleEditBtn(false);
    setTextInput(newEditItem.task);
    setIsEdit(todoId);
  };

  const markTodoCompleted = todoId => {
    const newTodos = todos.map(curElem => {
      if (curElem.id == todoId) {
        return {...curElem, completed: true};
      }
      return curElem;
    });
    setTodos(newTodos);
  };

  const deleteTodo = todoId => {
    const newTodos = todos.filter(curElem => curElem.id != todoId);
    setTodos(newTodos);
  };

  const clearTodos = () => {
    if (todosDeleted) {
      Alert.alert('Error', 'Add todo first');
    } else {
      Alert.alert('Confirm', 'Clear todos?', [
        {
          text: 'yes',
          onPress: () => {
            setTodos([]);
            setTodosDeleted(true);
          },
        },
        {
          text: 'No',
        },
      ]);
    }
  };

  return (
    <>
      {showUserName ? (
        <SafeAreaView style={{flex: 1, backgroundColor: '#e5e7eb'}}>
          <View
            style={{
              padding: 20,
              flexDirection: 'row',
            }}>
            <Text style={{fontWeight: 'bold', fontSize: 16, color: 'black'}}>
              Wellcome {userName}
            </Text>
          </View>
          <View style={styles.header}>
            <Text style={{fontWeight: 'bold', fontSize: 22, color: 'black'}}>
              Your Todos
            </Text>
            <FontAwesome5
              name={'trash'}
              size={20}
              color="#5C0000"
              onPress={clearTodos}
            />
          </View>
          <FlatList
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{padding: 20, paddingBottom: 100}}
            data={todos}
            renderItem={({item}) => <ListItem todo={item} />}
          />
          <View style={styles.footer}>
            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Add Todo"
                value={textInput}
                style={{color: 'black'}}
                placeholderTextColor="black"
                onChangeText={text => setTextInput(text)}
              />
            </View>
            <TouchableOpacity onPress={addTodo}>
              <View style={styles.iconContainer}>
                {toggleEditBtn ? (
                  <FontAwesome5 name={'plus'} size={25} color="#e5e7eb" />
                ) : (
                  <FontAwesome5 name={'pen'} size={25} color="#e5e7eb" />
                )}
              </View>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      ) : (
        <>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
              backgroundColor:"grey"
            }}>
            <View>
              <Text
                style={{
                  fontSize: 25,
                  marginHorizontal: 10,
                  marginVertical: 10,
                }}>
                Welcome
              </Text>
              <View
                style={{
                  backgroundColor: 'white',
                  elevation: 10,
                  borderRadius: 30,
                  paddingHorizontal: 20,
                  width: 300,
                }}>
                <TextInput
                  placeholder="Enter Your Name"
                  value={userName}
                  style={{color: 'black'}}
                  placeholderTextColor="black"
                  onChangeText={text => setUserName(text)}
                />
              </View>
              <View
                style={{
                  width: 300,
                  flexDirection: 'row',
                  justifyContent: 'center',
                  paddingTop: 10,
                }}>
                <TouchableOpacity
                  onPress={() => {
                    setShowUserName(userName);
                  }}>
                  <View
                    style={{
                      marginVertical: 10,
                      marginHorizontal: 10,
                      height: 40,
                      width: 80,
                      backgroundColor: 'white',
                      elevation: 10,
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderRadius: 5,
                    }}>
                    <Text style={{color:'black'}}>Next</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </>
      )}
    </>
  );
};

export default App;
