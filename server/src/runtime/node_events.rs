use uuid::Uuid;

use super::node::{Node, Value};


/**
 * NodeEvents are used to dynamically influence the behaviour of a Node
 */
pub trait NodeEvents<T> {
    /**
     * Runs after the node is created. Can be used to initialize something
     */
    fn on_node_init(node: &Node<T>);
    /**
     * Runs when the value of a node is read. The return value is the value that the caller receives.
     * This can be used to manipulate the value of a node
     * 
     * TODO: we need here some information about the reader
     */
    fn on_get_value(node: &Node<T>, value: Option<Value<T>>) -> Option<Value<T>>;
    
    /**
     * Runs when the node receives a new value from a listener of the node.
     * With this reactive nodes can be implemented.
     */
    fn on_receive_value(node: &Node<T>, value: Option<Value<T>>);

    // /**
    //  *  HOW SHOULD I MODEL DERIVED NODES ? with listeners ? do we need a reference to the runtime ? 
    //     if we hold a reference to the node we can pull the values in from the sender
    //  */
    // fn on_update_value(node: &Node<T>) -> bool;

    /**
     * Runs when the node subscribes to another node
     */
    // fn on_(node: &Node<T>, subscrib);


    /**
     * Runs after the value got updated and controls if the subscribers should be notified about the update
     * When returning None, the default should_notify implementation runs afterwards. Otherwise this result gets used
     */
    fn on_should_notify(node: &Node<T>, new_value: Option<Value<T>>, old_value: Option<Value<T>>) -> Option<bool>;
    /**
     * Runs when sombody subscribes to the node. 
     * The return value indicates if the subscription should be cancelled=false or if its ok=true
     */
    fn on_subscribe(node: &Node<T>, receiver_id: &Uuid) -> bool;
    /**
     * Runs when sombody unsubscribes from the node. Can be used to clean up something.
     */
    fn on_unsubscribe(node: &Node<T>, receiver_id: &Uuid);
}